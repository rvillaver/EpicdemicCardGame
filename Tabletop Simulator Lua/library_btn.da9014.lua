DISCARD_ZONE = Global.getVar("DISCARD_ZONE")
LIBRARY_ZONE = Global.getVar("LIBRARY_ZONE")
LOCK_ZONE = Global.getVar("LOCK_ZONE")

CARD_ZONES = Global.getTable("CARD_ZONES")
DISTRICT_ZONES = Global.getTable("DISTRICT_ZONES")

IATF_ZONE = Global.getVar("IATF_ZONE")


function onLoad()
    modeZone = getObjectFromGUID(IATF_ZONE)
    deckZone = getObjectFromGUID(LIBRARY_ZONE)
    lockZone = getObjectFromGUID(LOCK_ZONE)
    discardZone = getObjectFromGUID(DISCARD_ZONE)
    cardZones = {}
    cityZones = {}

    for _, guid in ipairs(CARD_ZONES) do
        table.insert(cardZones, getObjectFromGUID(guid))
    end
    for _, city in ipairs(DISTRICT_ZONES) do
        table.insert(cityZones, getObjectFromGUID(city))
    end    
end

function restartGame()
    if #lockZone.getObjects() > 0 then
        for _, player in ipairs(Player.getPlayers()) do
            player.setCameraMode("TopDown")
            if player ~= nil and #player.getHandObjects() > 0 then
                for _, card in ipairs(player.getHandObjects()) do
                    card.setPosition(discardZone.getPosition())
                end
            end
        end
        for _, city in ipairs(cityZones) do
            if #city.getObjects() > 0 then
                for _, card in ipairs(city.getObjects()) do
                    card.setPosition(discardZone.getPosition())
                end
            end
        end        
        for _, zone in ipairs(cardZones) do
            if #zone.getObjects() > 0 then
                local card = zone.getObjects()[1]
                zone.takeObject({flip=true})
                card.setPosition(discardZone.getPosition())
            end
        end

        Wait.frames(
            function()
                if #discardZone.getObjects() > 0 then
                    local discardDeck = discardZone.getObjects()
                    for i, card in ipairs(discardDeck) do
                        card.flip()
                        card.setPosition(deckZone.getPosition())
                    end                    
                end

                Wait.frames(
                    function()
                        local deck = deckZone.getObjects()[1]
                        deck.reset()
                        deck.deal(5)

                        Wait.frames(
                            function()
                                local size = #cardZones
                                for i, zone in ipairs(cardZones) do
                                    if i ~= 1 and i ~= size then
                                        deck.takeObject({flip=true, position=zone.getPosition()})
                                    end
                                end
                                Wait.frames(
                                    function()
                                        local lock = lockZone.getObjects()[1]
                                        lock.setPosition(modeZone.getPosition());
                                    end,
                                    60
                                )                                    
                            end,
                            60
                        )
                    end,
                    60
                )
                
            end, 
            60
        )
    end
end