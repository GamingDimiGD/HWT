$('.y').html(new Date().getFullYear() - 1911)
$('.m').html(new Date().getMonth() + 1)
$('.d').html(new Date().getDate())

let homeworkList = $.jStorage.get('hw') || []

const getDay = () => {
    const day = new Date().getDay()
    return ['日', '一', '二', '三', '四', '五', '六'][day]
}

$('.day').html(getDay())

const toHorizontalWords = () => {
    let e = []
    $.each($('.hw'), (i, hw) => {
        const hwText = hw.querySelector('.hw-text').innerText
        const regexp = /([ -z][^<>])\w*/g;
        let array = []
        const arr = [...hwText.matchAll(regexp)]
        arr.forEach(word => {
            array.push(word[0])
        });
        array.forEach(w => {
            hw.querySelector('.hw-text').innerHTML = hw.querySelector('.hw-text').innerHTML.replace(w, `<b class="num unbold">${w}</b>`)
        })
        e.push(array)
    })
    return e
}
const addHW = (hw) => {
    let input = hw.text
    const hwI = homeworkList.indexOf(homeworkList.find((hw) => hw.text === input))
    let eleText =
        `<div class="hw" --data-index="${hwI}" ><b class="num">${hwI + 1}.</b><b class="hw-text">${input}</b>
        <button class="remove" --data-index="${hwI}" >-</button><button class="edit" --data-index="${hwI}" ><i class="fa-solid fa-pen"></i></button><input type="color" class="color" --data-index="${hwI}"></div>`
    $('.hw-container').append(eleText)
    console.log($(`.remove[--data-index="${hwI}"]`))
    $(`.remove[--data-index="${hwI}"]`).on('click', () => {
        alertModal('確定刪除作業?', [
            {
                text: '確定',
                onclick: () => {
                    homeworkList = homeworkList.filter((hw) => hw.text !== input)
                    $('.hw-container').empty();
                    $.jStorage.set('hw', homeworkList)
                    homeworkList.forEach((hw) => addHW(hw))
                }
            },
            {
                text: '取消',
                onclick: () => {
                    // 按下取消時不做任何事情 - 那個ai
                }
            }
        ])
    })
    $(`.edit[--data-index="${hwI}"]`).on('click', () => {
        let input = prompt('請問你要更改成...')
        if (!input) return
        if (homeworkList.find((hw) => hw.text === input)) return alert('不可以重複!');
        homeworkList[hwI].text = input
        $('.hw-container').empty();
        $.jStorage.set('hw', homeworkList)
        homeworkList.forEach((hw) => addHW(hw))
        toHorizontalWords()
    })
    $(`.color[--data-index="${hwI}"]`).on('change', () => {
        let color = $(`.color[--data-index="${hwI}"]`).val()
        homeworkList[hwI].color = color
        $.jStorage.set('hw', homeworkList)
        console.log(color)
        $(`.hw[--data-index="${hwI}"]`).css('color', color)
    })
    if (homeworkList[hwI]) {
        $(`.color[--data-index="${hwI}"]`).val(homeworkList[hwI].color)
        $(`.hw[--data-index="${hwI}"]`).css('color', homeworkList[hwI].color)
    }
    toHorizontalWords()
}

$('.add-btn').on('click', () => {
    let input = $('.hw-input').val().trim()
    if (!input) return alert('請在裡面打東西!');
    if (homeworkList.find((hw) => hw.text === input)) return alert('不可以重複!');
    homeworkList.push({
        text: input,
    })
    $.jStorage.set('hw', homeworkList)
    addHW(input)
    $('.hw-input')[0].value = ''
    $('.hw-container').empty();
    homeworkList.forEach((hw) => addHW(hw))
})


homeworkList.forEach((hw) => addHW(hw))

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        $('.add-btn')[0].click()
    }
})

$('.clear').on('click', () => {
    alertModal('確定清除聯絡簿?', [
        {
            text: '確定',
            onclick: () => {
                $.jStorage.deleteKey('hw');
                $('.hw-container').empty();
                homeworkList = [];
                toHorizontalWords();
            }
        },
        {
            text: '取消',
            onclick: () => {
                // 按下取消時不做任何事情 - 那個ai
            }
        }
    ])
})