// html references
const requestSuccess = document.querySelector('#request-success');
const requestError = document.querySelector('#request-error');
const loading = document.querySelector('#loading');
const list = document.querySelector('#order-list');

/**
 * 
 * @param {*} status 
 */
function setStatus(status) {
    switch(status) {
        case 'error':
            requestSuccess.style.display = 'none';
            requestError.style.display = 'block';
            loading.style.display = 'none';
            break;
        case 'success':
            requestSuccess.style.display = 'block';
            requestError.style.display = 'none';
            loading.style.display = 'none';
            break;
        default:
            requestSuccess.style.display = 'none';
            requestError.style.display = 'none';
            loading.style.display = 'block';
            break;
    }
}

function parseDescription(description) {
    description = description
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
        .replace(/\n|\r/g, ' ');

    return description;
}

function parseTypology(typology) {
    typology = typology.replace(/\[.+\]/g, '');
    return typology;
}

function parseDates(date) {
    if(date) {
        date = new Date(date);
    }

    return date;
}

function parsePrice(price) {
    if(price) price = price + '€';
    return price;
}

function parseStore(store) {
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

function parseOrders(orders) {
    orders.forEach(order => {
        Object.keys(order).forEach(key => {
            switch(key) {
                case 'description':
                    order[key] = parseDescription(order[key]);
                    break;
                case 'typology':
                    order[key] = parseTypology(order[key]);
                    break;
                case 'date':
                case 'nextDate':
                    order[key] = parseDates(order[key]);
                    break;
                case 'store':
                    order[key] = parseStore(order[key]);
                    break;
                case 'price':
                    order[key] = parsePrice(order[key]);
                    break;
            }
        });
    });

    return orders;
}

function filterOrders(orders) {
    orders = orders.filter(order => {
        if(Object.values(order).some(o => o !== '')) return order;
    });

    return orders;
}

function showOrders(orders) {
    // orders.forEach(order => {
    //     if(order.type) {
    //         console.log(order.type);
    //         let elem = document.createElement('li');
    //         elem.innerHTML = order.type;
    //         list.appendChild(elem);
    //     }
    
    //     console.log(order);
    // });
}

function getOrders() {
    fetch("https://bitrix.e-goi.com/bizproc/processes/127/view/0/")
    .then(content => { return content.text() })
    .then(html => {
        let orders = [];
        const bitrixContent = new DOMParser().parseFromString(html, "text/html");
        let table = bitrixContent.querySelector('#lists_list_elements_127_table');
        let rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const contentSelector = '.main-grid-cell-content';
            const order = {
                date: row.children[2].querySelector(contentSelector)?.textContent || '',
                type: row.children[5].querySelector(contentSelector)?.textContent || '',
                nextDate: row.children[6].querySelector(contentSelector)?.textContent || '',
                description: row.children[10].querySelector(contentSelector)?.textContent || '',
                store: row.children[11].querySelector(contentSelector)?.textContent || '',
                typology: row.children[14].querySelector(contentSelector)?.textContent || '',
                price: row.children[15].querySelector(contentSelector)?.textContent || '',
            }
            orders.push(order);
        })

        orders = parseOrders(orders);
        orders = filterOrders(orders);
        showOrders(orders);
        setStatus('success');
    })
    .catch(error => {
        setStatus('error');
    });
}

// on load functions
setStatus('loading');
getOrders();