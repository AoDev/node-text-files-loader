Text Files Loader
=================

Load text files content from a directory, indexed into an object.
Note: currently it uses utf8. This can change if requested.

* It can search a given directory and subdirectories if needed.
* Filtering: add a filter to index files which name match a pattern.
* You have different options described below to format the result.

**Use case**

I built this module because we write SQL queries in separated files.
We wanted a way to load them in memory and access to them easily.

Something like `db.query(queries.item.findById, ...)`

Usage
-------

```
var textFilesLoader = require('text-files-loader')

textFilesLoader.setup({
  recursive: false,
  matchRegExp: /\.txt/
})

textFilesLoader.load('/myDirectory', function (err, indexedFiles) {
  console.log(indexedFiles)
})

// Log:
{
  file1: 'content of file 1',
  file2: 'content of file 2'
}
```


Options
--------

### recursive
default: true

Subdirectories will be searched too.


### keysAsFullPath
default: false


#### Example result when keysAsFullPath = false

Files locations:

```
/Users/user/path/to/file1.txt
/Users/user/path/to/file2.txt

textFilesLoader.load('/Users/user/path/to')
```

Result:
```
{
  'file1': 'content of the file',
  'file2': 'content of the file'
}
```

Be aware that keys may be overriden if files have the same name.


#### Example result when  keysAsFullPath = true

The resulting object keys will be the fullpath of each file.

```
{
  '/Users/user/path/to/file1.txt': 'content of the file',
  '/Users/user/path/to/file2.txt': 'content of the file'
}
```

### flatten
default: true

Use it with the recursive option.


#### Example result when flatten = true
The result will be a simple object regardless of the location of the file

Files locations:

```
/Users/user/path/to/file1.txt
/Users/user/path/to/deeper/file2.txt

textFilesLoader.load('/Users/user/path/to')
```

Result:
```
{
  'file1': 'content of the file',
  'file2': 'content of the file'
}
```

#### Example result when flatten = false

```
{
  'file1': 'content of the file',
  'deeper': {
    'file2': 'content of the file'
  }
}
```


### matchRegExp
default: null

provide a regular expression that the filename must match.

You can filter by file extension for example.

```
textFilesLoader.setup({matchRegExp: /\.sql/})
```
