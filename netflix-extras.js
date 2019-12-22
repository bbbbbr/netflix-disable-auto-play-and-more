// ==UserScript==
// @name         Netflix Auto-Skip Intro
// @namespace    http://www.netflix.com/
// @version      0.1
// @description  Netflix Auto-skip intro
// @author       Author
// @include     https://www.netflix.com/*
// @grant        none
// ==/UserScript==

// ..include     https://www.netflix.com/match *
// misses scenario where user navigates from home page (no reload, just url changes)


(function() {
    'use strict';
    // URL empty by defualt so first test will evaluate to true (changed)
    //  = document.location.toString();
    var url_match = "netflix\\.com\\/watch";
    var hook_info = { intro:        {state: false, url_current: ""},
                      recap:        {state: false, url_current: ""},
                      resumecredits:{state: false, url_current: ""},
                      postcreditspromo:{state: false, url_current: ""}};

    var selector_skip_intro_button = '[aria-label="Skip Intro"]';
    var selector_skip_recap_button = '[aria-label="Skip Recap"]';
    var selector_page_monitor = '[id=appMountPoint]';

    // var postplay_aftercredits_backbutton = 'div.AkiraPlayer > div > a.BackToBrowse';             // Div with click event to exit post-play and return to browse
    // During credits : .nfp-control-row or .top-left-controls > button.button-nfplayerBack  OR aria-label="Back to Browse" OR data-tooltip="Back to Browse" OR  data-uia="nfplayer-exit"

    // Try to suppress post-play "promoted" preview content
    //   Wait for promo area / countdown button to appear
    //   Then try to click the resume post-play button to bring the credits back
    // var selector_postplay_promo_area  = 'div.OriginalsPostPlay-BackgroundTrailer-promo-container'; // Div with "promoted" content
    var selector_postplay_resume_button = 'div.AkiraPlayer > div.can-resume.postplay';                // Div with click event to resume credits
    // var selector_postplay_aftercredits_countdown = '.countdown-container';
    var selector_postplay_aftercredits_countdown = '.season-renewal-actions';


    function removeElement(el) {
        return el.parentNode.removeChild(el);
    }

    //
    // Installs a listener for navigation changes that occur without a page reload
    //
    function registerNavigationChangeListener(callbackFunction, matchCriteria, buttoncriteria, hookname) {
        document.querySelector('html').addEventListener('DOMNodeInserted', function(ev){

            var url_new = document.location.toString();
            var urlMatches = new RegExp(matchCriteria, "i").test(url_new);
            // console.log("newurl?:" + (hook_info[hookname].url_current != url_new) + ", hook active?:" + hookname + " = " + hook_info[hookname].state + ", URLMatches: " + urlMatches + " - " + url_new);

            // Trigger callback if the url changed and it matches the criteria
            if ((hook_info[hookname].url_current != url_new) && (urlMatches) && (hook_info[hookname].state == false)) {
                callbackFunction(buttoncriteria, hookname);
            }

            hook_info[hookname].url_current = url_new;
        });
    }


    //
    // Triggers an event handler (such as onClick) for an element
    //
    function eventFire(el, etype)
    {
        if (el.fireEvent)
        {
            el.fireEvent('on' + etype);
        }
        else
        {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }


    //
    // Installs a mutation observer callback for nodes matching the given css selector
    //
    function registerMutationObserver(selectorCriteria, monitorSubtree, callbackFunction)
    {
        // Cross browser mutation observer support
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        // Find the requested DOM nodes
        var targetNodeList = document.querySelectorAll(selectorCriteria);


        // Make sure the required elements were found, otherwise don't install the observer
        if ((targetNodeList != null) && (MutationObserver != null)) {

            // Create an observer and callback
            var observer = new MutationObserver( callbackFunction );

            // Start observing the target element(s)
            for(var i = 0; i < targetNodeList.length; ++i) {

                observer.observe(targetNodeList[i], {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: monitorSubtree,
                    characterDataOldValue: true
                });
            }

            return true; // At least one hook succeeded
        }

        return false; // No nodes found to hook
    }


    //
    // Check if an element exists.
    // If found then remove all timers, optionally remove the element and indicate success
    //
    function removeAllTimersIfElementExists(queryselector, doRemoveElement) {

        var el = document.querySelector(queryselector);

        if (el != null) {

            // Remove all active timers
            var id = window.setTimeout(function() {}, 0);
            while (id--) {
                window.clearTimeout(id); // will do nothing if no timeout with id is present
            }

            // Remove element if requested
            if (doRemoveElement) {
                removeElement(el);
            }

            return (true); // Element found and timers removed
        }

        return (false); // Signal failure: element not found
    }


    //
    // Try to click a button.
    // If found indicate success (assume click event worked without testing)
    //
    function tryClick(queryselector) {

        var elButton = document.querySelector(queryselector);

        if (elButton != null) {
            // console.log("Sending Click for:" + queryselector);
            eventFire( elButton,'click' );

            return (true); // Button Clicked successfully
        }

        return (false); // Signal failure to send
    }



    //
    // This hook waits for the "Skip Intro" button (a subset of video controls) to
    // appear in the UI (#aria-label="Skip Intro"), then tries to click it.
    //
    function installButtonClickHook(queryselector, hookname)
    {
        // console.log("Start:" + hookname : " for " + queryselector);
        // Try to click the button immediately if possible
        if (! tryClick(queryselector)) {

            // If the element wasn't present then set up a mutation observer
            // to wait for the "Skip Intro" button (subset of video controls)
            // (Subtree monitoring enabled)

            hook_info[hookname].state = registerMutationObserver(selector_page_monitor, true,
                    function(mutations)
                    {
                        // console.log("Mutation...");
                        if (tryClick(queryselector)) {
                            // Disconnect once the intro skip event has been sent
                            this.disconnect();
                            hook_info[hookname].state = false;
                            // console.log("Disconnecting:" + hookname);
                        }
                    }
                );
        }
    }


    //
    // This hook waits for the "Skip Intro" button (a subset of video controls) to
    // appear in the UI (#aria-label="Skip Intro"), then tries to click it.
    //
    function installRemoveTimersHook(queryselector, hookname)
    {
        // console.log("Start:" + hookname + " for " + queryselector);

        // Wait for the element to show up, then try and remove all timers to
        // stop the countdown and then disconnect. It's sloppy, but works.
        // (Subtree monitoring enabled)
        hook_info[hookname].state = registerMutationObserver(selector_page_monitor, true,
            function(mutations)
            {
                // console.log("Mutations:" + hookname + " for " + queryselector);
                if (removeAllTimersIfElementExists(queryselector, true)) {
                    this.disconnect();
                    hook_info[hookname].state = false;
                    // console.log("Disconnecting:" + hookname);
                }
            }
        );
    }


    // TODO: now that these hooks have multipled in number, consider consolidating them into one mutation observer
    // Hook page navigation and try to detect when video watching starts,
    // then monitor for the skip intro button's appearance
    registerNavigationChangeListener(installButtonClickHook, url_match, selector_skip_intro_button, 'intro');
    registerNavigationChangeListener(installButtonClickHook, url_match, selector_skip_recap_button, 'recap');
    registerNavigationChangeListener(installButtonClickHook, url_match, selector_postplay_resume_button, 'resumecredits');

    registerNavigationChangeListener(installRemoveTimersHook, url_match, selector_postplay_aftercredits_countdown, 'postcreditspromo');


})();

