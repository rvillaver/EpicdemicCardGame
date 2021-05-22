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

function resetDiscard()
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
    end
end