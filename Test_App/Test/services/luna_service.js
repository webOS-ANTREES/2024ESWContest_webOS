let ls2 = undefined;

function init(service) {
    ls2 = service;
}

function toast(msg) {
    let toast_url = "luna://com.webos.notification/createToast";
    let toast_params = {
        message: msg,
        persistent: true
    };
    let callback = (m) => {
        console.log("[Toast] called : " + msg);
    }
    ls2.call(toast_url, toast_params, callback);
}

// Exporting the functions to be used in other files
exports.init = init;
exports.toast = toast;