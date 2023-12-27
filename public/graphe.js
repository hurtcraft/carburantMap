function createGraphique() {
    let data = [
        { x: 1, y: 2.2 },
        { x: 2, y: 2.4 },
        { x: 3, y: 2.1 },
        { x: 4, y: 1.8 },
        { x: 5, y: 1.0 }
    ];

    let div = document.createElement("div");

    let canvas = document.createElement("canvas");
    canvas.style.width = "200px";
    canvas.style.height = "200px";
    canvas.width = 200;
    canvas.height = 200;

    let ctx = canvas.getContext('2d');

    function drawCurve(data) {
        ctx.beginPath();
        ctx.moveTo(data[0].x, convertY(data[0].y));

        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(data[i].x*10, convertY(data[i].y));
        }

        ctx.stroke();
    }

    function convertY(y) {
        return canvas.height - (y / 5) * canvas.height;
    }

    function drawXAxis() {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();

        for (let i = 0; i <= 20; i++) {
            let xPosition = (i / 20) * canvas.width;

            ctx.moveTo(xPosition, canvas.height - 5);
            ctx.lineTo(xPosition, canvas.height + 5);
            ctx.stroke();
        }

        ctx.fillText("jour", canvas.width - 20, canvas.height - 5);
    }

    function drawYAxis() {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);
        ctx.stroke();

        for (let i = 0; i <= 5; i++) {
            let yPosition = (i / 5) * canvas.height;

            ctx.moveTo(-5, yPosition);
            ctx.lineTo(5, yPosition);
            ctx.stroke();
        }
        ctx.fillText("prix €", 10, 10);
    }

    function showCoordinates(event) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawCurve(data);
        drawXAxis();
        drawYAxis();

        ctx.beginPath();
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, canvas.height);
        ctx.moveTo(0, mouseY);
        ctx.lineTo(canvas.width, mouseY);
        ctx.stroke();

        ctx.fillText("jour: " + (mouseX / canvas.width * 20).toFixed(2), mouseX + 10, canvas.height / 2 - 10);
        ctx.fillText("prix € : " + ((canvas.height - mouseY) / canvas.height * 5).toFixed(2), canvas.width / 2 + 10, mouseY + 10);
    }

    canvas.addEventListener("mousemove", showCoordinates);

    drawCurve(data);
    drawXAxis();
    drawYAxis();
    div.append(canvas);
    return div;
}


export{createGraphique}