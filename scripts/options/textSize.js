import { hwt } from "../script.js";

export const updateTextSize = () => {
    $('.hw-container').css("font-size", `calc(${hwt.textSize} * 3.5rem)`);
    $('.today').css("font-size", `calc(${hwt.textSize} * 4rem)`);
    $('.text-size-display').text('文字大小: ' + hwt.textSize)
}

let cts = $('.change-text-size')

let isDragging = false

cts.on("mousedown", () => {
    isDragging = true
})

cts.on("mousemove", e => {
    if (!isDragging) return;
    hwt.textSize = cts.val()
    updateTextSize()
})

cts.on("click", e => {
    hwt.textSize = cts.val()
    updateTextSize()
})

cts.on("mouseup", () => {
    isDragging = false
})

$('.step-buttons-ts .increase').on("click", e => {
    cts[0].stepUp()
    hwt.textSize = cts.val()
    updateTextSize()
})
$('.step-buttons-ts .decrease').on("click", e => {
    cts[0].stepDown()
    hwt.textSize = cts.val()
    updateTextSize()
})