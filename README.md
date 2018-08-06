# Dynamic File Loader
Gets a file from the Web dynamically and puts it in the filesystem for use as a Node module later on.

## Overview
Sometimes you want static dependencies compiled with your code, and sometimes you want to load them dynamically.
This is a Naive implementation of loading those files then returning them.

## Testing your files
To test use the express server.
This is the path supported:
```
http://localhost:9090/loadfile/{url}
```

```{url}``` should be a uri encoded URL (you can use ```encodeURIComponent```).
