export const listOfFiles = (files, typeFile) => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `😱 *Woha!* I found these files${
                typeFile !== 'all' && typeFile ? ` of the type _${typeFile}_` : ''
            }`
        }
    },
    {
        type: 'divider'
    },
    ...files.map(file => ({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `${file.name} (${file.size} bytes)`
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'Delete',
                emoji: true
            },
            value: file.id,
            action_id: 'delete_image'
        }
    })),
    {
        type: 'divider'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    emoji: true,
                    text: `Delete all ${files.length}`
                },
                action_id: 'delete_all'
            },
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    emoji: true,
                    text: `Delete this message`
                },
                action_id: 'delete_message'
            }
        ]
    }
];
export const help = () => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*List of parameters*`
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `- *typeOfFile* Search files by this type, multiple values like 'spaces,snippets'. Default: 'all'. Possible values:
        - *all* : All files
        - *spaces* : Posts
        - *snippets* : Snippets
        - *images* : Image files
        - *gdocs* : Google docs
        - *zips* : Zip files
        - *pdfs* : PDF files
`
        }
    }
];

export const sharedFileEvent = fileId => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `Remember to delete your files after use them! Think green! 🌳`
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'Delete file',
                emoji: true
            },
            value: `${fileId}`,
            action_id: 'delete_image_from_event'
        }
    }
];

export const slackButton = clientId => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title>Scrapy bot installation</title>
  <meta name="description" content="Scrapy bot installation Button">
  <meta name="author" content="Daniel Biedma Ramos">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  * { -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; }html {  height: 100%;}body {  padding: 0;  margin: 0;  font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;  font-weight: 300;  line-height: 1.4;}h1, h2, h3 {  margin: 0;  text-rendering: optimizeLegibility;}header, footer, #main, #img {  max-width: 600px;  margin: 1em auto; text-align: center;}footer {  margin: 2em auto;  text-align: right;  text-decoration: italic;}header {  margin: 2em auto 1em;}header h1 {  font-size: 2.4em;  font-weight: normal;}#main a {  display: block;}
  </style>
</head>
<body>

  <header>
    <h1>Scrapy bot installation</h1>
  </header>

  <section id="img"><img src="https://raw.githubusercontent.com/danibram/scrapy-slack-bot/master/public/scrapy%40200.png" /></section>

  <section id="main" role="main">
    <p>This button allows you to install the bot in your Slack workspace.</p>
    <p>
    <a
    href="https://slack.com/oauth/authorize?client_id=${clientId}&scope=bot,files:read,commands,files:write:user"
    ><img
        alt="Add to Slack"
        height="40"
        width="139"
        src="https://platform.slack-edge.com/img/add_to_slack.png"
        srcset="
            https://platform.slack-edge.com/img/add_to_slack.png    1x,
            https://platform.slack-edge.com/img/add_to_slack@2x.png 2x
        "
    /></a>
    </p>
  </section>
  <footer>
  </footer>
</body>
</html>`;
