// ==UserScript==
// @name         Discord Orb Notifier
// @namespace    https://github.com/Sherwin-77/discord-orb-notifier
// @version      1.0
// @description  Effortlessly notify when orbs are available and speed up collecting them
// @author       Sherwin-77
// @match        *://*.discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    function ff() {
        document.querySelectorAll('[class^="videoCont_"] video').forEach(v => {
            v.playbackRate = 16; // raises the playback speed to the highest of it's ability
            v.volume = 0; // lowers the volume to avoid ear damage
            v.play(); // attempts to play the video if it isn't already
        });
    }
    const QuestsStore = Vencord.Webpack.findStore("QuestsStore");

    // TODO: access quests.values()
    /**
     * {
     *  ...
     *  userStatus,
     *  config: {
     *      rewardConfig: {
     *          orbQuantity
     *      }
     *   }
     * }
     */
})();