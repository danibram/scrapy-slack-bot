![Scrapy image like wall-e](./public/scrapy@200.png)

# Scrapy Slack Bot

Hi! Im Scrapy, a bot that helps your team to control shared files in slack.

## Instalation

Please, take me in clicking on the button below

<a href="https://slack.com/oauth/authorize?client_id=12052861009.553791303268&scope=bot,files:read,commands,files:write:user,chat:write:bot"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## Mission

-   Remind humans to delete shared files when they publised

    ![Scrapy image like wall-e](./public/reminder.png)

-   Provide humans a friendly way to find files in channels or conversations

    ![Scrapy image like wall-e](./public/list-command.png)
    
## Commands

- **_/list {typeOfFile}_** 

    * typeOfFile: Optional parameter. By default: `all`. For multiple values use coma separated values Ex.`images,spaces`. Posible values:
    
        - `all` : All files
        - `spaces` : Posts
        - `snippets` : Snippets
        - `images` : Image files
        - `gdocs` : Google docs
        - `zips` : Zip files
        - `pdfs` : PDF files
        
- _/how_use_the_bot_ : Shows the help of the bot. **_underconstruction_**

## Tecnologies

-   Typescript for the language
-   Fastify for the api
-   MongoDB for storing auth tokens
-   Serveo for provide a tunnel for development

## License

Licensed under the ISC license. 2019
