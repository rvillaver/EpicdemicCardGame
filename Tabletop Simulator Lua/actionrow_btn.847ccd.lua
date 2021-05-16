DISCARD_ZONE = Global.getVar("DISCARD_ZONE")
LIBRARY_ZONE = Global.getVar("LIBRARY_ZONE")
LOCK_ZONE = Global.getVar("LOCK_ZONE")

CARD_ZONES = Global.getTable("CARD_ZONES")


function onLoad()
    deckZone = getObjectFromGUID(LIBRARY_ZONE)
    lockZone = getObjectFromGUID(LOCK_ZONE)
    discardZone = getObjectFromGUID(DISCARD_ZONE)
    cardZones = {}

    for _, guid in ipairs(CARD_ZONES) do
        table.insert(cardZones, getObjectFromGUID(guid))
    end
end

function sortActions()
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
end