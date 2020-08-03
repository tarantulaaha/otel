export var client_data = new Object({
    promoCode: '',
    roomCount: 0,
    rooms: {
        'first_room': {
            adult: 1,
            children: []
        }
    },
    peoples: {
        children: 0,
        adult: 1
    },
    promo_code: '',
    selectedDate: {
        in: {
            selected: false,
            timestamp: 0
        },
        out: {
            selected: false,
            timestamp: 99999999999999
        }
    },
    childId: 1,
    needRefresh: true,
});
