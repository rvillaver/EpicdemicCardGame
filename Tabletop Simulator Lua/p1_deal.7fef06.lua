DISCARD_ZONE = Global.getVar("DISCARD_ZONE")
LIBRARY_ZONE = Global.getVar("LIBRARY_ZONE")
LOCK_ZONE = Global.getVar("LOCK_ZONE")
MAX_DISTRICT = Global.getVar("MAX_DISTRICT")

CARD_ZONES = Global.getTable("CARD_ZONES")
DISTRICT_ZONES = Global.getTable("DISTRICT_ZONES")

function onLoad()
    deckZone = getObjectFromGUID(LIBRARY_ZONE)
    lockZone = getObjectFromGUID(LOCK_ZONE)
    discardZone = getObjectFromGUID(DISCARD_ZONE)
    cardZones = {}

    for _, guid in ipairs(CARD_ZONES) do
        table.insert(cardZones, getObjectFromGUID(guid))
    end

    districtZone = getObjectFromGUID(DISTRICT_ZONES[1])
end

function dealCard()  
    if #deckZone.getObjects() > 0 then
        local deck = deckZone.getObjects()[1]
        local districtCount = #districtZone.getObjects()
        local pos = districtZone.getPosition()
        if districtCount < MAX_DISTRICT then
            if deck.type == "Card" then
                deck.flip()
                deck.setPositionSmooth({pos[1], pos[2], pos[3]+4.5-(districtCount * 1)}) 
            else
                deck.takeObject({flip=true, position={pos[1], pos[2], pos[3]+4.5-(districtCount * 1)}})            
            end
        end 
    else
        if #discardZone.getObjects() > 0 then
            local discard = discardZone.getObjects()[1]
            if discard.type == "Card" then
                deck.flip()
                deck.setPositionSmooth(deckZone.getPosition()) 
            else
                discard.shuffle()
                discard.flip()
                discard.setPositionSmooth(deckZone.getPosition())
            end
            Wait.frames(
                function()
                    local deck = deckZone.getObjects()[1]
                    local districtCount = #districtZone.getObjects()
                    local pos = districtZone.getPosition()
                    if districtCount < MAX_DISTRICT then
                        if deck.type == "Card" then
                            deck.flip()
                            deck.setPositionSmooth({pos[1], pos[2], pos[3]+4.5-(districtCount * 1)}) 
                        else
                            deck.takeObject({flip=true, position={pos[1], pos[2], pos[3]+4.5-(districtCount * 1)}})            
                        end
                    end 
                end,
                60
            )
        end  
    end
    local left = cardZones[1];
    local right = cardZones[7];
    if #left.getObjects()>0 or #right.getObjects()>0 then
        Wait.frames(
            function()
                local hasCards = {}
                for _, zone in ipairs(cardZones) do
                    if #zone.getObjects() > 0 then
                        table.insert(hasCards, zone.getObjects()[1])
                    end
                end
    
                for i, card in ipairs(hasCards) do
                    if cardZones ~= nil and cardZones[i+1] ~= nil then
                        card.setPositionSmooth(cardZones[i+1].getPosition())
                    end
                end
            end,
            60
        )
    end
end