Create a file with extexion `.conf`

```conf
FACEBOOK_ID=[String]
FACEBOOK_SECRET=[String]
GOOGLE_ID=[String]
GOOGLE_SECRET=[String]
TWITTER_ID=[String]
TWITTER_SECRET=[String]
COINBASE_ID=[String]
COINBASE_SECRET=[String]
URL_DOMAIN=[String]
HTTPS_ACTIVE=[Boolean]
COMPRESS_RESP_CSS=[Boolean]
COMPRESS_RESP_JS=[Boolean]
NODE_ENV=[String]
```
In console
```
  $ rhc set-env [name_file_variables].conf -a [app] -n [domain]
  $ rhc restart -a [app] -n [domain]
```

Well... No more

