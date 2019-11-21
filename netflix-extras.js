// ==UserScript==
// @name         Netflix Auto-Skip Intro
// @namespace    http://www.netflix.com/
// @version      0.1
// @description  Netflix Auto-skip intro
// @author       Author
// @include     https://www.netflix.com/watch/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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
        }
    }


    //
    // Try to click the "Skip Intro" button.
    // If found indicate success (assume click event worked without testing)
    //
    function tryClickSkipIntro() {

        var elSkipIntro = document.querySelector('[aria-label="Skip Intro"]');

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
            registerMutationObserver('[id=appMountPoint]', true,
                function(mutations)
                {
                    console.log("Mutation...");
                    if (tryClickSkipIntro()) {
                        // Disconnect once the intro skip event has been sent
                        this.disconnect();
                    }
                }
            );
        }
    }


    installSkipIntroHook();
})();