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
    var url_current = "";
    var url_match   = "netflix\\.com\\/watch"
    var hook_active = false;

    var selector_skip_intro_button = '[aria-label="Skip Intro"]';
    var selector_page_monitor = '[id=appMountPoint]';


    //
    // Installs a listener for navigation changes that occur without a page reload
    //
    function registerNavigationChangeListener(callbackFunction, matchCriteria) {
        document.querySelector('html').addEventListener('DOMNodeInserted', function(ev){

            var url_new = document.location.toString();
            var urlMatches = new RegExp(matchCriteria, "i").test(url_new);
            // console.log("newurl?:" + (url_current != url_new) + ", hook:" +  hook_active + ", Matches: " + urlMatches + " - " + url_new);

            // Trigger callback if the url changed and it matches the criteria
            if ((url_current != url_new) && (urlMatches) && (hook_active == false)) {
                callbackFunction();
            }

            url_current = url_new;
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
    // Try to click the "Skip Intro" button.
    // If found indicate success (assume click event worked without testing)
    //
    function tryClickSkipIntro() {

        var elSkipIntro = document.querySelector(selector_skip_intro_button);

        if (elSkipIntro != null) {
            console.log("Sending Click");
            eventFire( elSkipIntro,'click' );

            return (true); // Button Clicked successfully
        }

        return (false); // Signal failure to send
    }



    //
    // This hook waits for the "Skip Intro" button (a subset of video controls) to
    // appear in the UI (#aria-label="Skip Intro"), then tries to click it.
    //
    function installSkipIntroHook()
    {
        console.log("Start");
        // Try to click the button immediately if possible
        if (! tryClickSkipIntro()) {

            // If the element wasn't present then set up a mutation observer
            // to wait for the "Skip Intro" button (subset of video controls)
            // (Subtree monitoring enabled)

            hook_active = registerMutationObserver(selector_page_monitor, true,
                    function(mutations)
                    {
                        // console.log("Mutation...");
                        if (tryClickSkipIntro()) {
                            // Disconnect once the intro skip event has been sent
                            this.disconnect();
                            hook_active = false;
                        }
                    }
                );
        }
    }


    // Hook page navigation and try to detect when video watching starts,
    // then monitor for the skip intro button's appearance
    registerNavigationChangeListener(installSkipIntroHook, url_match);


})();
