// obtain notifications enabled and last notification date
chrome.storage.sync.get('erhshop_notifications', function (notification) {
    if (notification['erhshop_notifications']) {
        chrome.storage.sync.get('erhshop_dates', function(dates) {
            chrome.storage.sync.get('erhshop_last_notification', function (lastNotification) {
                if(lastNotification['erhshop_last_notification']) {
                    const lastDate = new Date(lastNotification);
                    const todayDate = new Date().setHours(9, 30, 0);
                    if(lastDate < todayDate) {
                        sendNotification(dates['erhshop_dates']);
                    }
                } else {
                    sendNotification(dates['erhshop_dates']);
                }
            });
        });
    }
});

function sendNotification(dates) {
    let counter = 0;
    let content = document.createElement('div');
    dates.forEach(date => {
        const splittedDate = date.nextDate.split("/");
        const parsedDate = new Date(splittedDate[2], splittedDate[1] - 1, splittedDate[0]); 
        const tempDatefDIf = parsedDate - new Date().getTime();
        const days = Math.ceil(tempDatefDIf / (1000 * 3600 * 24));
        if(days < 50) {
            let p = document.createElement('p');
            p.innerHTML = `Faltam ${days} para comprar um artigo da tipologia ${date.type}!`;
            content.appendChild(p);
            counter++;
        }
    });

    if(counter > 0) {
        generateNotification(content);
        chrome.storage.sync.set({'erhshop_last_notification': new Date()});
    }
}

function generateNotification(content) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.right = '10px';
    container.style.bottom = '10px';
    container.style.backgroundColor = '#212529';
    container.style.color = 'white';
    container.style.minHeight = '50px';
    container.style.zIndex = '99999';
    container.style.width = '25%';
    container.style.borderRadius = '10px';
    container.style.cursor = 'pointer';
    container.style.padding = '15px';
    container.appendChild(content);
    container.addEventListener('click', () => {
        container.remove();
    })
    document.body.appendChild(container);
}