# A very simple but flexible block-site extension for Chrome

**🚨🚨🚨 The extension is still in beta mode as long as the v1 isn't released. 🚨🚨🚨**

## Why this extension

I used to pay for [BlockSite extension](https://blocksite.co/), but somehow, I was not really using it.

It works great but I couldn't setup time range when I wanted some websites to be disabled.

It allowed time ranges applying to all blocked websites.

## How to use Website Blocker ⁉️

1. Download the source code and unzip it in your preferred location.
2. Browse to [chrome://extensions/](chrome://extensions/).
3. Activate the Developer mode at the top right of the tab.
4. Click `load unpacked` and select the directory where you unzip the source code
5. If the installation completed, click `Details` on the extension
6. Active `Pin to toolbar`
7. Start configuring the website to block

## Features ✅

A blocking entry is defined with:

- a URL chunk (ex: "youtube" or even "youtube.com")
- a start time (hour:minute)
- an end time (hour:minute)

You can have several entries with the same URL chunk but different time ranges.

You cannot disable the website blocker in the settings while keeping the extension enabled because I feel that it will allow you to cheat. You can still update the time range you're blocking the

You can :

- [x] Add as many websites as possible
- [x] Allow to remove a single entry
- [x] Add as many time ranges as possible per website
- [x] Block any website browsed to in the current hour and minute falls between any of the entries
- [x] Use the autocomplete when typing url chunck value
- [x] See the blocked page with a random background changes pulled [from Lorem Picsum](https://picsum.photos/).
- [x] Store entries in indexedDb
- [x] Edit each entry's start and end time
- [x] Add the blocked website URL and a button to open the settings.
- [x] Export and import configuration from a CSV file
- [x] Export and import configuration from a JSON file
- [x] Export and import configuration from Google Drive (https://github.com/JeremieLitzler/website-blocker-extension/issues/3)
  - Note: while this work for me, I have yet to publish the OAuth application on Google. You can [ask me to add you a test user](https://iamjeremie.me/page/contact-me/?utm_source=GitHub&utm_medium=social), if you want to try in the meantime.
- [x] Display a random quote about staying focused, indistractable or working on one task at a time (https://github.com/JeremieLitzler/website-blocker-extension/issues/2)
- [x] Display a random call-to-action as the heading about staying focused, indistractable or working on one task at a time (https://github.com/JeremieLitzler/website-blocker-extension/issues/15)
- [x] Add the ability to select the day(s) of the week when the time range applies (https://github.com/JeremieLitzler/website-blocker-extension/issues/16)
- [x] Show "Unsaved changes" message when editing (https://github.com/JeremieLitzler/website-blocker-extension/issues/17)
- [ ] Add form validation when typing the times (https://github.com/JeremieLitzler/website-blocker-extension/issues/5)
- [ ] Improve popup UI of blocked page (https://github.com/JeremieLitzler/website-blocker-extension/issues/10)
- [ ] Warn user about overlapping time ranges for same website (https://github.com/JeremieLitzler/website-blocker-extension/issues/4)
- [ ] Add a Pomodoro timer to the extension (https://github.com/JeremieLitzler/website-blocker-extension/issues/6)
- [ ] Allow blocked websites during pomodoro short breaks (https://github.com/JeremieLitzler/website-blocker-extension/issues/7)
- [ ] Add a calendar view of the blocked sites (https://github.com/JeremieLitzler/website-blocker-extension/issues/14)
- [ ] Add the ability to send desktop push notifications when a website becomes unblocked (https://github.com/JeremieLitzler/website-blocker-extension/issues/14)
- [ ] Publish the extension to the Chrome Webstore (https://github.com/JeremieLitzler/website-blocker-extension/issues/12)
- [ ] Publish the OAuth application (https://github.com/JeremieLitzler/website-blocker-extension/issues/11)
- [ ] Convert to TypeScript (https://github.com/JeremieLitzler/website-blocker-extension/issues/8)
- [ ] Add tests (https://github.com/JeremieLitzler/website-blocker-extension/issues/9)

## Troubleshooting 🐞

If your blocked websites aren't blocked, try the following:

1. Reload the extension
2. Reinstall the extension
3. Finally, submit a bug and as many details as possible to reproduce the issue.

## Supporting this project 🙋

You can submit pull request for bugs at anytime. For new feature, please describe why you need it.

For financial support, please [use my sponsor page](https://iamjeremie.me/page/sponsor-me/?utm_source=GitHub&utm_medium=social).

## Credits

Thanks to the team at Anthropic for developping [Claude.ai](https://claude.ai?utm_source=Thank%2Dyou%2DAnthropic%2DTeam&utm_medium=social). It helped me greatly to build this!
