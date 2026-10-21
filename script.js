(function () {
        "use strict";
        var tracks = [
            ["Midnight Signal", 220, [0, 4, 7, 11, 7, 4]],
            ["Violet Transit", 174, [0, 3, 7, 10, 7, 3]],
            ["Blue Horizon", 261.63, [0, 7, 9, 5, 4, 2]],
          ],
          urls = [],
          at = 0,
          repeat = false,
          $ = function (x) {
            return document.getElementById(x);
          },
          audio = $("audio");
        function wav(base, steps) {
          var rate = 22050,
            dur = 12,
            len = rate * dur,
            buffer = new ArrayBuffer(44 + len * 2),
            v = new DataView(buffer);
          function str(o, s) {
            for (var i = 0; i < s.length; i++)
              v.setUint8(o + i, s.charCodeAt(i));
          }
          str(0, "RIFF");
          v.setUint32(4, 36 + len * 2, true);
          str(8, "WAVEfmt ");
          v.setUint32(16, 16, true);
          v.setUint16(20, 1, true);
          v.setUint16(22, 1, true);
          v.setUint32(24, rate, true);
          v.setUint32(28, rate * 2, true);
          v.setUint16(32, 2, true);
          v.setUint16(34, 16, true);
          str(36, "data");
          v.setUint32(40, len * 2, true);
          for (var i = 0; i < len; i++) {
            var t = i / rate,
              step = steps[Math.floor(t * 2) % steps.length],
              f = base * Math.pow(2, step / 12),
              env =
                Math.min(1, ((t * 2) % 1) * 8) *
                Math.min(1, (1 - ((t * 2) % 1)) * 4),
              sample =
                (Math.sin(2 * Math.PI * f * t) * 0.38 +
                  Math.sin(2 * Math.PI * f * 0.5 * t) * 0.18) *
                env;
            v.setInt16(44 + i * 2, sample * 32767, true);
          }
          return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
        }
        tracks.forEach(function (x) {
          urls.push(wav(x[1], x[2]));
          var b = document.createElement("button");
          b.className = "track";
          b.innerHTML =
            "<span>" +
            x[0] +
            "<br><small>Nightwave Studio</small></span><b>0:12</b>";
          b.onclick = function () {
            at = tracks.indexOf(x);
            load(true);
          };
          $("tracks").appendChild(b);
        });
        function load(auto) {
          audio.src = urls[at];
          $("title").textContent = tracks[at][0];
          document.querySelectorAll(".track").forEach(function (x, i) {
            x.classList.toggle("active", i === at);
          });
          if (auto) audio.play();
        }
        function fmt(s) {
          return (
            Math.floor(s / 60) +
            ":" +
            String(Math.floor(s % 60)).padStart(2, "0")
          );
        }
        audio.ontimeupdate = function () {
          $("seek").value = audio.duration
            ? (audio.currentTime / audio.duration) * 100
            : 0;
          $("current").textContent = fmt(audio.currentTime);
          $("duration").textContent = fmt(audio.duration || 0);
        };
        audio.onplay = function () {
          $("player").classList.add("playing");
          $("play").textContent = "❚❚";
        };
        audio.onpause = function () {
          $("player").classList.remove("playing");
          $("play").textContent = "▶";
        };
        audio.onended = function () {
          if (repeat) audio.play();
          else {
            at = (at + 1) % tracks.length;
            load(true);
          }
        };
        $("play").onclick = function () {
          audio.paused ? audio.play() : audio.pause();
        };
        $("prev").onclick = function () {
          at = (at - 1 + tracks.length) % tracks.length;
          load(true);
        };
        $("next").onclick = function () {
          at = (at + 1) % tracks.length;
          load(true);
        };
        $("repeat").onclick = function () {
          repeat = !repeat;
          $("repeat").style.background = repeat ? "var(--a)" : "";
        };
        $("seek").oninput = function () {
          if (audio.duration)
            audio.currentTime = (audio.duration * +$("seek").value) / 100;
        };
        $("volume").oninput = function () {
          audio.volume = +$("volume").value;
        };
        audio.volume = 0.7;
        load(false);
        addEventListener("beforeunload", function () {
          urls.forEach(URL.revokeObjectURL);
        });
      })();
