var Cosext = {
    trello: {
        key: 'c3ffcadf2354345a9bb1a63f72e019e1',
        secret: 'cf1b08ca81d7ca914907f8d6bc3baa27db935fb98732aae4a6fedcf7329494ef',
        token: '3d980f8dfc435239f58257da2f9bce19c9b68185fb2f6320141721957bfac44a'
    },

    status: {
        activate: function () {
            chrome.browserAction.setIcon({
                tabId: this.id,
                path: "img/active.png"
            });
        },

        deactivate: function () {
            chrome.browserAction.setIcon({
                tabId: this.id,
                path: "img/default.png"
            });
        },

        changeBy: function (status) {
            if (status) {
                this.activate();
            }
            else {
                this.deactivate();
            }
            chrome.tabs.executeScript({
                code: ('document.body.setAttribute("status",' + status + ');')
            });
        },

        set: function(status) {
            chrome.storage.sync.set({'status': status});
        }
    }
};

chrome.storage.onChanged.addListener(function (changes) {
    for (key in changes) {
        if (key == 'status') {
            Cosext.status.changeBy(changes['status'].newValue);
        }
    }
});

chrome.storage.sync.get(['status'], function (items) {
    Cosext.status.changeBy(items.status);
});


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.storage.sync.get(['status'], function (items) {
        Cosext.status.set(!items.status);
    });
});

chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.type == 'status') {
            Cosext.status.set(false);
        }
    });

