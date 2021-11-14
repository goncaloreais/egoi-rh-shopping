/**
 * popup.js is responsible for the popup/user interaction
 * such as updating the view or holding the functions
 * which users will trigger
 */

// imports
import { 
    parseContent,
    filterContent,
    orderContent,
    parseContentDates
} from './utils.js';

// holds the list of orders
let nextDates = [];
let orderHistory = [];
let notifications = false;

// holds the html references for manipulation
const successRef = document.querySelector('.success');
const errorRef = document.querySelector('.error');
const loadingRef = document.querySelector('.loading');
const historyRef = document.querySelector('.history');
const nextDatesRef = document.querySelector('.next-dates');
const historyTableRef = document.querySelector('#history-table-body');
const nextDatesListRef = document.querySelector('.next-dates-list');
const contentTitleRef = document.querySelector('.title');
const nextTitleLabelsRef = document.querySelector('.next-date-labels');
const contentRef = document.querySelector('.content');
const notificationGroupToggle = document.querySelector('#notifications-toggle');
const notificationToggleInput = notificationGroupToggle.querySelector('input');

// adds the event listeners for buttons
document.querySelector('#nextDatesButton').addEventListener('click', () => { changeContent('nextDates') });
document.querySelector('#historyButton').addEventListener('click', () => { changeContent('history') });
notificationGroupToggle.addEventListener('click', () => { setNotifications() });

/**
 * obtains bitrix html and webscrapes it to get the orders
 */
function getOrders() {
    setStatus('loading');
    changeContent('nextDates');

    getNotificationInfo();

    fetch("https://bitrix.e-goi.com/bizproc/processes/127/view/0/")
    .then(content => { return content.text() })
    .then(html => {
        // whole html
        const bitrixContent = new DOMParser().parseFromString(html, "text/html");
        // orders table
        const table = bitrixContent.querySelector('#lists_list_elements_127_table');
        // each row, so, each order
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const contentSelector = '.main-grid-cell-content';

            // every info about the order
            const order = {
                date: row.children[2].querySelector(contentSelector)?.textContent || '',
                type: row.children[5].querySelector(contentSelector)?.textContent || '',
                description: row.children[10].querySelector(contentSelector)?.textContent || '',
                price: row.children[15].querySelector(contentSelector)?.textContent || '',
                store: row.children[11].querySelector(contentSelector)?.textContent || '',
                typology: row.children[14].querySelector(contentSelector)?.textContent || '',
                nextDate: row.children[6].querySelector(contentSelector)?.textContent || '',
            }

            orderHistory.push(order);

            // info needed for next dates
            const nextDate = {
                type: row.children[5].querySelector(contentSelector)?.textContent || '', 
                nextDate: row.children[6].querySelector(contentSelector)?.textContent || '',
            }

            nextDates.push(nextDate);
        })

        // parses orders and dates contents
        let [parsedOrderHistory, parsednNextDates] = filterContent(orderHistory, nextDates);
        [parsedOrderHistory, parsednNextDates] = parseContent(parsedOrderHistory, parsednNextDates);
        [parsedOrderHistory, parsednNextDates] = orderContent(parsedOrderHistory, parsednNextDates);
        [parsedOrderHistory, parsednNextDates] = parseContentDates(parsedOrderHistory, parsednNextDates);
        
        // 
        showContent(parsedOrderHistory, parsednNextDates);
        setStatus('success');
        setNextDateStorage(parsednNextDates);
    })
    .catch(error => {
        console.log(error);
        setStatus('error');
    });
}

/**
 * changes between history and next date list
 * @param {*} content can be 'history' or 'nextDate'
 */
function changeContent(content) {
    if(content === 'history') {
        contentRef.classList = 'content';
        nextTitleLabelsRef.style.display = 'none';
        contentTitleRef.innerHTML = 'Histórico de Compras';
        historyRef.style.display = 'initial';
        nextDatesRef.style.display = 'none';
    } else {
        contentRef.classList = 'content mx-3';
        nextTitleLabelsRef.style.display = 'block';
        contentTitleRef.innerHTML = 'Próximas Datas';
        historyRef.style.display = 'none';
        nextDatesRef.style.display = 'initial';
    }
}

/**
 * sets the right status
 * @param {*} status status that can be 'error', 'success' or 'loading'
 */
function setStatus(status) {
    switch(status) {
        case 'error':
            successRef.style.display = 'none';
            errorRef.style.display = 'block';
            loadingRef.style.display = 'none';
            break;
        case 'success':
            successRef.style.display = 'block';
            errorRef.style.display = 'none';
            loadingRef.style.display = 'none';
            break;
        default:
            successRef.style.display = 'none';
            errorRef.style.display = 'none';
            loadingRef.style.display = 'block';
            break;
    }
}

/**
 * generates the content of tables and list
 * @param {*} orders parsed orders to show
 * @param {*} nextDates parsed next dates to show
 */
function showContent(orders, nextDates) {
    orders.forEach(order => {
        const row = document.createElement('tr');
        Object.keys(order).forEach((key, index) => {
            const col = document.createElement('td');
            col.classList = index === 2 ? 'ellipsis expand' : 'ellipsis';
            col.innerHTML = order[key];
            row.appendChild(col);
        });

        historyTableRef.appendChild(row);
    });

    nextDates.forEach(date => {
        const li = document.createElement('li');
        li.classList = 'list-group-item d-flex justify-content-between align-items-center';
        
        const span = document.createElement('span');
        span.classList = 'badge rounded-pill';
        span.innerHTML = date.nextDate;

        let tempDatefDIf = new Date().getTime() - date.nextDate;
        let days = Math.ceil(tempDatefDIf / (1000 * 3600 * 24));

        switch(true) {
            case days <= 7:
                span.classList = span.classList + ' bg-success';
                break;
            case days <= 30:
                span.classList = span.classList + ' bg-primary';
                break;
            default:
                span.classList = span.classList + ' bg-danger';
                break;
        }
        
        li.innerHTML = date.type;
        li.appendChild(span);

        nextDatesListRef.appendChild(li);
    })
}


function getNotificationInfo() {
    chrome.storage.sync.get('erhshop_notifications', function(result) {
        notifications = notificationToggleInput.checked = result['erhshop_notifications'] || false;
    });
}

function setNotifications() {
    notifications = !notifications;
    chrome.storage.sync.set({'erhshop_notifications': notifications}, function() {
        if(notifications) {
            chrome.storage.sync.set({'erhshop_last_notification': null});
        }
    });
}

function setNextDateStorage(nextDates) {
    chrome.storage.sync.set({'erhshop_dates': nextDates});
}

// on load functions
getOrders();