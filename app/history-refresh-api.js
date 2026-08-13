// Disabled: production forecast history is provided by generated data/history_web.js only.
// Keeping live history refresh off prevents the browser from overwriting verified history after page load.
window.refreshMangekampHistory = async function(){ return window.MANGEKAMP_HISTORY; };
