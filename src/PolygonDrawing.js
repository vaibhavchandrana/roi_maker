import React, { useState, useEffect, useRef } from "react";

function PolygonDrawing() {
  const [perimeter, setPerimeter] = useState([]);
  const [complete, setComplete] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(960);
  const [canvasHeight, setCanvasHeight] = useState(640);
  const [imageInputType, setImageInputType] = useState("file");
  const [publicImageUrl, setPublicImageUrl] = useState("");
  const [imageSource, setImageSource] = useState(
    "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg"
  );
  const canvasRef = useRef(null);
  const coordinatesTextareaRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.src = imageSource;

    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      if (perimeter.length > 0) {
        draw(false);
      }
    };
  }, [imageSource, canvasWidth, canvasHeight]);
  useEffect(() => {
    // Call the draw function after setting the new image
    draw(false);
  }, [perimeter, newImage]);
  function line_intersects(p0, p1, p2, p3) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1["x"] - p0["x"];
    s1_y = p1["y"] - p0["y"];
    s2_x = p3["x"] - p2["x"];
    s2_y = p3["y"] - p2["y"];

    var s, t;
    s =
      (-s1_y * (p0["x"] - p2["x"]) + s1_x * (p0["y"] - p2["y"])) /
      (-s2_x * s1_y + s1_x * s2_y);
    t =
      (s2_x * (p0["y"] - p2["y"]) - s2_y * (p0["x"] - p2["x"])) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      // Collision detected
      return true;
    }
    return false; // No collision
  }

  const point = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.moveTo(x, y);
  };

  const undo = () => {
    setPerimeter([]);
    setComplete(false);
    start(true);
  };

  const clearCanvas = () => {
    setPerimeter([]);
    setComplete(false);
    coordinatesTextareaRef.current.value = "";
    start();
  };

  const draw = (end) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    ctx.beginPath();

    for (let i = 0; i < perimeter.length; i++) {
      if (i === 0) {
        ctx.moveTo(perimeter[i].x, perimeter[i].y);
        end || point(perimeter[i].x, perimeter[i].y);
      } else {
        ctx.lineTo(perimeter[i].x, perimeter[i].y);
        end || point(perimeter[i].x, perimeter[i].y);
      }
    }
    if (end) {
      ctx.lineTo(perimeter[0].x, perimeter[0].y);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fill();
      ctx.strokeStyle = "blue";
      setComplete(true);
    }
    ctx.stroke();

    if (perimeter.length === 0) {
      coordinatesTextareaRef.current.value = "";
    } else {
      coordinatesTextareaRef.current.value = JSON.stringify(perimeter);
    }
  };

  const checkIntersect = (x, y) => {
    if (perimeter.length < 4) {
      return false;
    }
    const p0 = {};
    const p1 = {};
    const p2 = {};
    const p3 = {};

    p2.x = perimeter[perimeter.length - 1].x;
    p2.y = perimeter[perimeter.length - 1].y;
    p3.x = x;
    p3.y = y;

    for (let i = 0; i < perimeter.length - 1; i++) {
      p0.x = perimeter[i].x;
      p0.y = perimeter[i].y;
      p1.x = perimeter[i + 1].x;
      p1.y = perimeter[i + 1].y;
      if (p1.x === p2.x && p1.y === p2.y) {
        continue;
      }
      if (p0.x === p3.x && p0.y === p3.y) {
        continue;
      }
      if (line_intersects(p0, p1, p2, p3) === true) {
        return true;
      }
    }
    return false;
  };

  const point_it = (event) => {
    if (complete) {
      alert("Polygon already created");
      return false;
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (event.ctrlKey || event.which === 3 || event.button === 2) {
      if (perimeter.length === 2) {
        alert("You need at least three points for a polygon");
        return false;
      }
      const firstPoint = perimeter[0];
      if (checkIntersect(firstPoint.x, firstPoint.y)) {
        alert("The line you are drawing intersects another line");
        return false;
      }
      draw(true);
      alert("Polygon closed");
      event.preventDefault();
      return false;
    } else {
      if (
        perimeter.length > 0 &&
        x === perimeter[perimeter.length - 1].x &&
        y === perimeter[perimeter.length - 1].y
      ) {
        // same point - double click
        return false;
      }
      if (checkIntersect(x, y)) {
        alert("The line you are drawing intersects another line");
        return false;
      }
      setPerimeter([...perimeter, { x, y }]);
      draw(false);
      return false;
    }
  };

  const start = (withDraw) => {
    const canvas = canvasRef.current;
    const img = new Image();
    img.src = canvas.getAttribute("data-imgsrc");

    img.onload = function () {
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (withDraw === true) {
        draw(false);
      }
    };
  };

  const copyToClipboard = () => {
    if (coordinatesTextareaRef.current) {
      const textToCopy = coordinatesTextareaRef.current.value;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("Text copied to clipboard");
        })
        .catch((error) => {
          alert("Error copying text to clipboard");
        });
    }
  };
  const handleImageSourceChange = (e) => {
    setImageInputType(e.target.value);
    if (e.target.value === "link") {
      setImageSource(publicImageUrl);
    }
  };

  const handlePublicImageUrlChange = (e) => {
    setPublicImageUrl(e.target.value);
    if (imageInputType === "link") {
      setImageSource(e.target.value);
    }
  };

  const handleWidthChange = (e) => {
    const width = parseInt(e.target.value, 10);
    setCanvasWidth(isNaN(width) ? 0 : width);
  };

  const handleHeightChange = (e) => {
    const height = parseInt(e.target.value, 10);
    setCanvasHeight(isNaN(height) ? 0 : height);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
        setImageSource(reader.result);
        setPerimeter([]);
        setComplete(false);
        start(true);
        // Call the draw function after setting the new image
        draw(false);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="container mt-3">
      <div className="mt-5">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border" // Added a border for better visibility
          style={{ cursor: "crosshair" }}
          data-imgsrc={newImage || imageSource}
          onMouseDown={point_it}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Image Source</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="imageSourceOptions"
                id="fileUpload"
                value="file"
                checked={imageInputType === "file"}
                onChange={handleImageSourceChange}
              />
              <label className="form-check-label" htmlFor="fileUpload">
                File Upload
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="imageSourceOptions"
                id="publicLink"
                value="link"
                checked={imageInputType === "link"}
                onChange={handleImageSourceChange}
              />
              <label className="form-check-label" htmlFor="publicLink">
                Public Link
              </label>
            </div>
          </div>

          {imageInputType === "file" ? (
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          ) : (
            <input
              className="form-control"
              type="text"
              placeholder="Enter image URL"
              value={publicImageUrl}
              onChange={handlePublicImageUrlChange}
            />
          )}

          <div className="mb-3">
            <label className="form-label">Width:</label>
            <input
              className="form-control"
              type="number"
              value={canvasWidth}
              onChange={handleWidthChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Height:</label>
            <input
              className="form-control"
              type="number"
              value={canvasHeight}
              onChange={handleHeightChange}
            />
          </div>
        </div>

        <div className="col-md-6">
          <div>
            <button className="btn btn-primary me-2" onClick={undo}>
              Undo
            </button>
            <button className="btn btn-danger" onClick={clearCanvas}>
              Clear
            </button>
            <p className="mt-3">
              Press <strong>Left Click</strong> to draw a point.
            </p>
            <p>
              <strong>CTRL+Click</strong> or <strong>Right Click</strong> to
              close the polygon.
            </p>
          </div>
          <div>
            <p>
              <strong>Coordinates:</strong>
            </p>
            <textarea
              id="coordinates"
              ref={coordinatesTextareaRef}
              className="form-control" // Bootstrap textarea class
              style={{ width: "100%", height: "200px" }}
              disabled
            ></textarea>
          </div>
          <button className="btn btn-success mt-2" onClick={copyToClipboard}>
            Copy Coordinates
          </button>
        </div>
      </div>
    </div>
  );
}

export default PolygonDrawing;
