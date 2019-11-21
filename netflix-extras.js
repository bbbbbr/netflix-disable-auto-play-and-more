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
// dom-utils.js
//
//
// Misc. tools for interacting with the DOM



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
    // When first connecting to Serpentine and the game is loading up, this hook will wait for
    // the board settings to appear in the UI (#words element) as an indicator that everything
    // is ready to go. It then tries to initialize the room/board/gameplay/etc
    //

    // class = skip-credits skip-credits-hidden
    // PlayerControlsNeo__layout PlayerControlsNeo__layout--inactive PlayerControlsNeo__layout--dimmed
    // AkiraPlayer
    // --> aria-label="Skip Intro"
    function installSkipIntroHook()
    {
        console.log("Start");


                var elSkipIntro = document.querySelector('[aria-label="Skip Intro"]');

                console.log( document.querySelector('[id=appMountPoint]') );

// TODO: try to disconnect right away if possible

        // Subtree monitoring enabled in order to catch changes to the text sub node
        registerMutationObserver('[id=appMountPoint]', true,
            function(mutations)
            {
                console.log("Mutation...");

                var elSkipIntro = document.querySelector('[aria-label="Skip Intro"]');

                console.log(elSkipIntro);
                if (elSkipIntro != null)
                {
                    eventFire( elSkipIntro,'click' );

                    // return (true); // Word sent successfully
                    this.disconnect();
                }
                else
                {
                    // return (false); // Signal failure to send
                }

                // // Try to initialize the room
                //  if (initRoom())
                //  {
                // If the init succeeded then stop monitoring the words element for mutations
                // this.disconnect();
                //   }
            });
    }


    installSkipIntroHook();
})();