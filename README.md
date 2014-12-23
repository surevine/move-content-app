move-content-app
================

Jive app (based on node.js jive-sdk) for move content in bulk between groups / spaces

Please find my blog on Jive Community at http://bit.ly/1xGNBUA which mentions about this add-on.

This add-on is a good example which shows how jive-sdk can be used to develop node.js apps without much complex javascript frameworks.

App supports and is tested in Jive 7.0.1 hosted instance and jive cloud 8c4.
I have not tested it on an on-prem instance as I don't have access to one.
I am assuming it should work, but someone might have to test it once.


Steps to install the add-on

1. Checkout this repository
2. put your node.js jive-sdk server's url in jiveclientconfiguration.json
3. run command "npm update" to download all the dependencies of this app.
4. Run command "node app" which will start the server and also generate an extension.zip
5. Upload the extension.zip to you Jive instance as mentioned in this offical jive document --> http://bit.ly/13zig97

The move content app is now ready to use.

The app link is displayed on the tab in groups and spaces.


About the app

Supported content move flows : space->space, space->group, group->group, group-space
supported content types : discussions, documents, files, polls, ideas, events
Displayed on the place tab as per app action mentioned here --> https://community.jivesoftware.com/docs/DOC-114464#jive_content_id_Place_Tab_Action

How to add/remove content type to display in the app?
The supported content types are in an array called SUPPORTED_CONTENT_TYPES in movecontent.js

How to change number of content ti display on one page?
Change the var ITEMS_PER_PAGE in movecontent.js. 

Known issue
I have seen an issue with jive's javascript api / REST api where too many simulteneous calls gives a 500 internal error for some contents. But they get moved in next attempt. 
So I have made the app's ui intuitive to show the progress of passed / failed content along with the usual spinner :)


