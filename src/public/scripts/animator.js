class Animator {
  static ANIM_INTERVAL = null;
  constructor() {
    this.startAnim();
  }
  stopAnim() {
    clearInterval(Animator.ANIM_INTERVAL);
    Animator.ANIM_INTERVAL = null;
    this.spawnPixel();
  }

  startAnim() {
    this.clearAll();
    Animator.ANIM_INTERVAL = setInterval(() => {
      this.spawnPixelPair(true);
    }, 300);
  }
  clearAll() {
    $(".pixel").remove();
    $("line").remove();
  }
  spawnPixel() {
    let winW = $('.chatCircleHolder').width();
    let winH = $('.chatCircleHolder').height();


    let x = Math.floor(Math.random() * (winW - 15));
    let y = Math.floor(Math.random() * (winH - 15));

    let $pixel = $("<div class='pixel pixelConnected'></div>").css({
      left: x + "px",
      top: y + "px",
    });
    $("body").append($pixel);

    // Get #circle center
    let $circle = $("#circle");
    let circleOffset = $circle.offset();
    let circleX = circleOffset.left + $circle.outerWidth() / 2;
    let circleY = circleOffset.top + $circle.outerHeight() / 2;

    // Pixel center
    let pixelX = x + 10; // half width (20px)
    let pixelY = y + 10;

    // Create line
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", circleX);
    line.setAttribute("y1", circleY);
    line.setAttribute("x2", pixelX);
    line.setAttribute("y2", pixelY);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "1");

    // Append to SVG
    $("#linesLayer")[0].appendChild(line);

    // ---- Animate with stroke-dasharray ----
    // Get line length
    let length = Math.hypot(pixelX - circleX, pixelY - circleY);

    line.setAttribute("stroke-dasharray", length);
    line.setAttribute("stroke-dashoffset", length); // fully hidden
    line.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 1000,
      fill: "forwards",
      easing: "ease-out",
    });
  }
  spawnPixelPair() {
    let buffer = 0; // 20px away from screen edges
    let winW = $('.chatCircleHolder').width();
    let winH = $('.chatCircleHolder').height();

    // Spawn first pixel
    let x1 = Math.floor(Math.random() * (winW - 40)) + buffer; // 20px buffer on each side
    let y1 = Math.floor(Math.random() * (winH - 40)) + buffer;

    let $p1 = $("<div class='pixel pixelAnimated'></div>").css({
      left: x1 + "px",
      top: y1 + "px",
    });

    $("body").append($p1);

    // Spawn second pixel
    let x2 = Math.floor(Math.random() * (winW - 20));
    let y2 = Math.floor(Math.random() * (winH - 20));

    let $p2 = $("<div class='pixel pixelAnimated'></div>").css({
      left: x2 + "px",
      top: y2 + "px",
    });

    $("body").append($p2);

    // Pixel centers
    let p1x = x1 + 10,
      p1y = y1 + 10;
    let p2x = x2 + 10,
      p2y = y2 + 10;

    // Create line between the two pixels
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1x);
    line.setAttribute("y1", p1y);
    line.setAttribute("x2", p2x);
    line.setAttribute("y2", p2y);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "1");

    $("#linesLayer")[0].appendChild(line);

    // Animate line with stroke-dasharray
    let length = Math.hypot(p2x - p1x, p2y - p1y);
    line.setAttribute("stroke-dasharray", length);
    line.setAttribute("stroke-dashoffset", length);

    // Animate "draw"
    line.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 1000,
      fill: "forwards",
      easing: "ease-out",
    });
    // Animate "retract"
    setTimeout(() => {
      $(line).remove();
      $p1.remove();
    }, 2000);

    // Remove both pixels + line
    setTimeout(() => {
      $p1.remove();
      $p2.remove();
      $(line).remove();
    }, 3000);
  }
}
export default new Animator();
