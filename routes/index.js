var express = require('express');
var webTorrent = require('webtorrent');
var parseTorrent = require('parse-torrent');
var router = express.Router();
var client = new webTorrent({torrentPort: 6881});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'magnet2ed2k' });
});

router.post('/', function(req, res, next) {
  var infohash = null;

  try {
    infohash = parseTorrent(req.body.magnet).infoHash;
  } catch (e) {
  }

  if (infohash) {
    var links = [];

    function onTorrent(torrent) {
      torrent.deselect(0, torrent.pieces.length - 1, false);
      torrent.pause();
      torrent.files.forEach(function(file) {
        if (file.ed2k) links.push('ed2k://|file|'+file.name+'|'+file.length+'|'+file.ed2k.toString('hex')+'|/');
      });
      res.render('index', { title: 'magnet2ed2k', magnet: infohash, links: links, msg: 'Found' });
    }

    var torrent = client.get(infohash);
    if (torrent)
      if ('d13:announce-listle8:url-listlee' != torrent.torrentFile)
        onTorrent(torrent);
      else
        res.render('index', { title: 'magnet2ed2k', magnet: infohash, msg: 'Torrent downloading, please wait' });
    else {
      client.add(infohash);
      res.render('index', { title: 'magnet2ed2k', magnet: infohash, msg: 'Torrent added, please wait' });
    }
  } else
    res.render('index', { title: 'magnet2ed2k', msg: 'Invalid torrent identifier' });
});

module.exports = router;
