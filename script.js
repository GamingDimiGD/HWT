$('.y').html(new Date().getFullYear() - 1911)
$('.m').html(new Date().getMonth() + 1)
$('.d').html(new Date().getDate())

let homeworkList = $.jStorage.get('hw') || []

const getDay = () => {
    const day = new Date().getDay()
    return ['日', '一', '二', '三', '四', '五', '六'][day]
}

$('.day').html(getDay())

// i have committed a warcrime
let to全形 = [
    {
        i: '(',
        o: '（'
    },
    {
        i: ')',
        o: '）'
    },
    {
        i: '[',
        o: '［'
    },
    {
        i: ']',
        o: '］'
    },
    {
        i: '{',
        o: '｛'
    },
    {
        i: '}',
        o: '｝'
    },
    {
        i: '~',
        o: '～'
    }
]

const toHorizontalWords = () => {
    let e = []
    $.each($('.hw'), (i, hw) => {
        const hwText = hw.querySelector('.hw-text').innerText
        // const regexp = /([ -z][^<>])\w*/g;
        const regexp = /[!-z]+/g;
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

const initOptionModal = (hwI) => {
    let hwText = homeworkList[hwI].text
    $('.remove, .edit, .color, .left, .right').off()
    $(`.remove`).on('click', () => {
        alertModal('確定刪除作業?', [
            {
                text: '確定',
                onclick: () => {
                    homeworkList = homeworkList.filter((hw) => hw.text !== hwText)
                    $('.hw-container').empty();
                    $.jStorage.set('hw', homeworkList)
                    homeworkList.forEach((hw) => addHW(hw))
                    $('.hw-options').removeClass('show')
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
    $(`.edit`).on('click', () => {
        $('.edit-hw').addClass('show')
        $('.edit-input').val(hwText)
        $('.edit-input').focus()
        $('.save-btn')[0].onclick = () => {
            let input = $('.edit-input').val().trim()
            if (!input) return alert('請在裡面打東西!');
            to全形.forEach(char => {
                input = input.replaceAll(char.i, char.o)
            })
            if (homeworkList.find((hw) => hw.text === input)) {
                return $('.edit-hw').removeClass('show')
            }
            homeworkList[hwI].text = input
            $('.hw-container').empty();
            $.jStorage.set('hw', homeworkList)
            homeworkList.forEach((hw) => addHW(hw))
            hwText = input
            toHorizontalWords()
            $('.edit-hw').removeClass('show')
        }
    })
    $('.color').val(homeworkList[hwI].color)
    $(`.color`).on('change', () => {
        let color = $(`.color`).val()
        homeworkList[hwI].color = color
        $.jStorage.set('hw', homeworkList)
        console.log(color)
        $(`.hw[--data-index="${hwI}"]`).css('color', color)
    })
    $('.left').on('click', () => {
        if (hwI < homeworkList.length - 1) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI + 1]
            homeworkList[hwI + 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI++
            toHorizontalWords()
        }
    })
    $('.right').on('click', () => {
        if (hwI > 0) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI - 1]
            homeworkList[hwI - 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI--
            toHorizontalWords()
        }
    })
}

const addHW = (hw) => {
    let input = hw.text
    const hwI = homeworkList.indexOf(homeworkList.find((hw) => hw.text === input))
    let eleText =
        `<div class="hw" --data-index="${hwI}" ><b class="num">${hwI + 1}.</b><b class="hw-text">${input}</b>
        <button class="hw-options" --data-index="${hwI}"><i class="fa-solid fa-gear" aria-hidden="true"></i></button></div>`
    $('.hw-container').append(eleText)
    $(`.hw-options[--data-index="${hwI}"]`).on('click', () => {
        $('.hw-options').addClass('show')
        initOptionModal(hwI)
    })
    if (homeworkList[hwI]) {
        $(`.color[--data-index="${hwI}"]`).val(homeworkList[hwI].color)
        $(`.hw[--data-index="${hwI}"]`).css('color', homeworkList[hwI].color)
    }
    toHorizontalWords()
}

const addInput = (input) => {
    if (!input) return alert('請在裡面打東西!');
    to全形.forEach(char => {
        input = input.replaceAll(char.i, char.o)
    })
    if (homeworkList.find((hw) => hw.text === input)) return alert('不可以重複!');
    homeworkList.push({
        text: input,
        color: '#ffffff',
    })
    $.jStorage.set('hw', homeworkList)
    addHW(input)
    $('.hw-input')[0].value = ''
    $('.hw-container').empty();
    homeworkList.forEach((hw) => addHW(hw))
}

$('.add-btn').on('click', () => {
    let input = $('.hw-input').val().trim()
    addInput(input)
})

homeworkList.forEach((hw) => addHW(hw))

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if ($('.edit-hw').hasClass('show')) return $('.save-btn')[0].click();
        if ($('.fast-enter').hasClass('show')) return $('.submit-fe')[0].click();
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

let isPageRange = true
$('.custom-range').hide()

const trm = () => {
    isPageRange = !isPageRange
    if (isPageRange) {
        $('.page-range').show();
        $('.custom-range').hide();
    } else {
        $('.page-range').hide();
        $('.custom-range').show();
    }
    $('.page-range input, #custom-range-input').val('')
}

$('.submit-fe').on('click', () => {
    if (!$('select#type').val() || !$('select#subject').val() || !$('select#choose-book-type').val()) return alert('作業未輸入完整!')
    if ($('select#type').val() === ' ') $('select#type').val('')
    if (isPageRange) {
        if (isNaN($('#page-from').val())) return alert('作業未輸入完整!')
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + "P." + $('#page-from').val()
        if ($('#page-to').val() && $('#page-from').val() !== $('#page-to').val()) text += "~P." + $('#page-to').val()
        addInput(text)
    } else {
        if (!$('#custom-range-input').val()) return alert('作業未輸入完整!')
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + $('#custom-range-input').val()
        addInput(text)
    }
    $('select#type, select#subject, select#choose-book-type, #page-to, #page-from, #custom-range-input').val('')
    $('.fast-enter').removeClass('show')
    return;
})