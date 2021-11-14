// removes urls from description
function parseDescription(description) {
    if(description) {
        description = description
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
            .replace(/\n|\r/g, ' ');
    }
    
    return description;
}

// removes typology code
function parseTypology(typology) {
    if(typology) typology = typology.replace(/\[.+\]/g, '');
    return typology;
}

// sets dates as date objects
function parseDates(date) {
    if (date) {
        let string = date.substring(0, 10);
        let splittedDate = string.split(".");
        date = new Date(splittedDate[2], splittedDate[1] - 1, splittedDate[0]); 
    }

    return date;
}

// adds euro symbol to prices
function parsePrice(price) {
    if(price) price = price + '€';
    return price;
}

// sets the right store names
function parseStore(store) {
    if(!store) return store;

    const stores = {
        'Amazon': 6,
        'GlobalData': 10,
        'Castro': 6,
        "Clavel's": 13,
        'Colorfoto': 9,
        'Decathlon': 9,
        'Digitfoto': 9,
        'E-goi': 5,
        'GMS': 9,
        'IKEA': 4, 
        'reMarkable': 10,
        'Thomann': 7,
        'ForPrint': 8
    };

    Object.keys(stores).forEach(key => {
        if(store.includes(key)) {
            store = store.substring(0, stores[key]);
        }
    });

    if(store === '(not set)') store = '';
    return store;
}

function parsingSwitch(order, key) {
    switch(key) {
        case 'description':
            return parseDescription(order);
        case 'typology':
            return parseTypology(order);
        case 'date':
        case 'nextDate':
            return parseDates(order);
        case 'store':
            return parseStore(order);
        case 'price':
            return parsePrice(order);
        default:
            return order;
    }
}

/**
 * sets the right content, parsing every property
 * @param {*} orders list of orders
 * @param {*} nextDates list of next dates
 * @returns parsed orders and next dates 
 */
export function parseContent(orders, nextDates) {
    orders.forEach(order => {
        Object.keys(order).forEach(key => {
            order[key] = parsingSwitch(order[key], key);
        });
    });

    nextDates.forEach(date => {
        Object.keys(date).forEach(key => {
            date[key] = parsingSwitch(date[key], key);
        });
    });

    return [orders, nextDates];
}

function dateIsInFuture(date) {
    return new Date(date).valueOf() > new Date().valueOf();
}

function returnParsedDate(data) {
    if(data['date']) {
        data['date'] = data['date'].toLocaleDateString("pt-PT");
        if(data['date'] === 'Invalid Date') data['date'] = '';
    };
    
    if(data['nextDate']) {
        data['nextDate'] = data['nextDate'].toLocaleDateString("pt-PT");
        if(data['nextDate'] === 'Invalid Date') data['nextDate'] = '';
    };
    return data;
}

export function parseContentDates(orders, nextDates) {
    orders = orders.map(order => {
        return returnParsedDate(order);
    });

    nextDates = nextDates.map(date => {
        return returnParsedDate(date);
    });

    return [orders, nextDates];
}

export function filterContent(orders, nextDates) {
    orders = orders.filter(order => {
        if(Object.values(order).some(o => o !== '')) return order;
    });

    nextDates = nextDates.filter(date => {
        if(date.type && date.nextDate && dateIsInFuture(date.nextDate)) return date;
    })

    return [orders, nextDates];
}

export function orderContent(orders, nextDates) {
    orders = orders.sort((a, b) => {
        return b.date - a.date;
    });

    nextDates = nextDates.sort((a, b) => {
        return a.nextDate - b.nextDate;
    });
    
    return [orders, nextDates];
}
