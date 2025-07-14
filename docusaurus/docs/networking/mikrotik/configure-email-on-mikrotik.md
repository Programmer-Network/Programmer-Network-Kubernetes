---
title: Configure Email on MikroTik
---

If your public IP changes or similar events occur, it's useful to receive notifications.

There are many ways to achieve this, such as calling a webhook to send a Slack or Discord message. The simplest method, however, is to send an email to yourself. This guide uses Gmail as an example.

Before configuring email on RouterOS, generate an app password for your Gmail account.

You can do this by [generating an app password](https://myaccount.google.com/apppasswords). Store the password securely in a password manager like LastPass or 1Password.

Next, configure the router’s SMTP settings:

```rsc
/tool e-mail
set address=smtp.gmail.com port=587 start-tls=yes from=your.email@gmail.com user=your.email@gmail.com password=your-app-password
```

Test the configuration:

```rsc
/tool e-mail send to="your.email@gmail.com" subject="MikroTik Test" body="Hello from the router"
```

This provides a general-purpose tool for sending emails from your MikroTik router. Use it for monitoring, alerts, or any scenario where email notifications are helpful, for example, when IP access is granted or denied, or when a specific event occurs.

In the next section, we'll cover how to send an email when a particular event happens.
