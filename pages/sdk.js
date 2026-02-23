// Заглушка Yandex Games SDK для локального запуска в Swift Playgrounds
window.YaGames = {
    init: async function () {
        return {
            environment: {
                i18n: {
                    lang: "ru"
                }
            },
            features: {
                LoadingAPI: {
                    ready: function () {}
                }
            },
            adv: {
                showFullscreenAdv: function (opts) {
                    // Сразу сообщаем "реклама закрыта" — игра продолжается
                    if (opts && opts.callbacks && opts.callbacks.onClose) {
                        opts.callbacks.onClose();
                    }
                }
            }
        };
    }
};
