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

function logger(level, ...args) {
    if (level == 'error' || level == 'err') {
        color = '#e78284';
    } else if (level == 'warning' || level == 'warn') {
        color = '#e5c890';
    } else {
        color = '#a6d189';
    }
    console[level](
        `%c Discord Orb Notifier %c`,
        `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`,
        ""
        , ...args
    );
}

window.addEventListener('DOMContentLoaded', async function () {
    logger('log', 'DOM Content Loaded');
    function ff() {
        document.querySelectorAll('[class^="videoCont_"] video').forEach(v => {
            v.playbackRate = 16; // raises the playback speed to the highest of it's ability
            v.volume = 0; // lowers the volume to avoid ear damage
            v.play(); // attempts to play the video if it isn't already
        });
    }
    const timestamp = localStorage.getItem('orbNotifLastTime') || 0;
    if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
        logger('log', `Checked last ${((Date.now() - timestamp) / 1000 / 60).toFixed(2)} minutes ago. Next check in ${((12 * 60 * 60 * 1000 - (Date.now() - timestamp)) / 1000 / 60).toFixed(2)} minutes.`);
        return;
    }

    const delay = 1500;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (unsafeWindow.Vencord) {
            logger('log', "Vencord object is ready");
            break;
        }

        const waitTime = delay * attempt * 2;
        logger('warning', `⏳ Attempt ${attempt + 1}: retrying in ${waitTime}ms`);

        // sleep
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    if (! unsafeWindow.Vencord) {
        logger('error', "Vencord object is not found. Quitting...");
        return;
    }
    
    const Vencord = unsafeWindow.Vencord;
    await Vencord.Webpack.onceReady;
    const {FluxDispatcher} = Vencord.Webpack.Common;

    function handleUnclaimedQuests(data) {
        const source = data.source ? ` [${data.source}]` : "";
        logger('info', `Quest Fetch Success Dispatched: ${source}`)
        const quests = data.quests
        const unclaimedOrbQuests = Array.from(quests.values()).filter(quest => ! quest.userStatus && quest.config?.rewardsConfig?.rewards?.some(reward => reward?.orbQuantity > 0));
        // Get stored unclaimed from storage
        const storedUnclaimed = JSON.parse(localStorage.getItem('orbNotifUnclaimed')) || [];
        const newUnclaimed = unclaimedOrbQuests.filter(quest => ! storedUnclaimed.includes(quest.id));
        // Set stored unclaimed to storage
        localStorage.setItem('orbNotifUnclaimed', JSON.stringify(unclaimedOrbQuests.map(quest => quest.id)));
        localStorage.setItem('orbNotifLastTime', Date.now());

        // Notify if there are unclaimed orbs
        if (newUnclaimed.length > 0) {
            Vencord.Api.Notifications.showNotification({
                title: "Orbs Notifier",
                body: `You have ${newUnclaimed.length} unclaimed orbs. Don't forget to collect them!`,
                color: "var(--blurple-44)",
                permanent: true,
            });
        } else {
            console.log(unclaimedOrbQuests);
            console.log(quests);
            logger('info', "No unclaimed orbs found.");
        }

        FluxDispatcher.unsubsribe('QUESTS_FETCH_CURRENT_QUESTS_SUCCESS', handleUnclaimedQuests);
    }

    FluxDispatcher.subscribe('QUESTS_FETCH_CURRENT_QUESTS_SUCCESS', handleUnclaimedQuests)
}, false)