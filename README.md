# netflix-disable-auto-play-and-more

Netflix UI Fixes: 
* Auto-skip Intros
* Auto-skip Recaps
* Disable auto-play Next Episode
* Disable auto-play Next Promoted Content

There is no UI, so if you want to disable any of the above features then find and comment out the relevant registerNavigationChangeListener() call at the bottom of the file.

If you using ublock origin, you might consider adding these filters to disable auto-play when browsing:
```
www.netflix.com##.billboard-row
www.netflix.com##.bob-video-merch-player-wrapper
www.netflix.com##.video-component-container
www.netflix.com##.volatile-billboard-animations-container
www.netflix.com##.volatile-billboard-animations-container
www.netflix.com##.VideoMerchPlayer

! This is in browse: (USE THIS) nfp nf-player-container notranslate active NFPlayer VideoMerchPlayer VideoMerchPlayer--visible VideoMerchPlayer--in-jaw
! This is in normal playback:   nfp nf-player-container notranslate NFPlayer nextEpisode
```
