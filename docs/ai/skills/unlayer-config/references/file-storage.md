# Unlayer File Storage Reference

## Custom Image Upload with Progress (XHR)

```javascript
unlayer.registerCallback("image", function (file, done) {
  var xhr = new XMLHttpRequest();

  xhr.upload.onprogress = function (e) {
    done({ progress: Math.round((e.loaded / e.total) * 100) });
  };

  xhr.onload = function () {
    var result = JSON.parse(xhr.responseText);
    done({ progress: 100, url: result.url });
  };

  xhr.onerror = function () {
    console.error("Upload failed");
  };

  var data = new FormData();
  data.append("file", file.attachments[0]);
  xhr.open("POST", "/api/uploads");
  xhr.send(data);
});
```

## File Manager Provider

```javascript
unlayer.registerProvider("userUploads", function (params, done) {
  var page = params.page || 1;
  var perPage = params.perPage || 20;
  var searchText = params.searchText;

  fetch(
    `/api/images?page=${page}&perPage=${perPage}&search=${searchText || ""}`,
  )
    .then((r) => r.json())
    .then((data) => {
      var images = data.items.map((img) => ({
        id: img.id,
        location: img.url,
        width: img.width,
        height: img.height,
        contentType: img.contentType,
        source: "user",
      }));
      done(images, {
        hasMore: data.total > page * perPage,
        page: page,
        perPage: perPage,
        total: data.total,
      });
    });
});
```

## Handle Image Deletion

```javascript
unlayer.registerCallback("image:removed", function (image, done) {
  fetch(`/api/images/${image.id}`, { method: "DELETE" }).then(() => done());
});
```

## Amazon S3 Setup Notes

- Configure storage in the Unlayer dashboard under **Settings -> Storage**.
- Keep credentials out of client code and committed docs.
- If this repo adds upload flows, route secret-backed behavior through server-side boundaries.
