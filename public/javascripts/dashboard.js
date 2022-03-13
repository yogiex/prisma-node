const { 
    debounceTime,
    map,
    distinctUntilChanged,
    mergeMap
} = rxjs.operators
const {fromEvent, of, Observable} = rxjs



let inputFormOrder = document.getElementById('inputPesanan')
let urlProducts = 'http://localhost:3000/dashboard/query-search?food='
let textChange$ = fromEvent(inputFormOrder,'keydown')

let autoSuggest$ = textChange$.pipe(
    map((e) => e.target.value),
    debounceTime(1000),
    distinctUntilChanged(),
    mergeMap((value) => 
        value ? fetch(urlProducts+value).then((response) => response.json()) : of([]),
    )
)
autoSuggest$.subscribe((v) => {
    let list = document.getElementsByClassName('list-group')[0]
    while(list.firstChild) {
        list.removeChild(list.firstChild)
    }
    for(let makanan of v) {
        // console.log(makanan)
        let li = document.createElement("li")
        let textNode = document.createTextNode(makanan.title)
        li.setAttribute("class","list-group-item list-group-item-primary")
        li.appendChild(textNode)
        li.addEventListener('click',() => {
            inputFormOrder.value = textNode.textContent
        })
        list.appendChild(li);
    }
    console.log('bisa subkreb?')
})

const tambahDataOrderForm = async () => {
    let urlOrder = 'http://localhost:3000/dashboard/'
    let data = []
    let valInput = document.getElementById('inputPesanan').value
    await fetch(`${urlOrder}find-one/${valInput}`,{
        method: 'GET',
        
    }).then((resp) => resp.json())
    .then(datas => data = datas)
    
    // console.log(data[0])
    const {title,price,id} = data[0]
    let arrPrice = []
    let arrQty = []
    console.log(price)
    // var domtbody = document.createElement('tbody')
    
    let inpQty = document.createElement('input')
    inpQty.setAttribute('type','number')
    inpQty.setAttribute('class','form-control')
    inpQty.setAttribute('value','1')
    inpQty.setAttribute('id','quantityInput')
    inpQty.setAttribute('name','quantity')

    let inputPrice = document.createElement('input')
    inputPrice.setAttribute('type','number')
    inputPrice.setAttribute('class','form-control')
    inputPrice.setAttribute('value',price)
    inputPrice.setAttribute('id','inputPrice')
    inputPrice.setAttribute('disabled',true)


    let inputIdFood = document.createElement('input')
    inputIdFood.setAttribute('name','foods')
    inputIdFood.setAttribute('type','hidden')
    inputIdFood.setAttribute('value',id)

    var domtr = document.createElement('tr')
    var td1 = document.createElement('td')
    var td2 = document.createElement('td')
    var td3 = document.createElement('td')

    
    td3.appendChild(inpQty)
    td3.appendChild(inputIdFood)
    td1.innerHTML = title
    td2.appendChild(inputPrice)
    domtr.innerHTML += td1.outerHTML + td2.outerHTML + td3.outerHTML
    
    document.getElementById('tablebody').appendChild(domtr)

}
const calculatePesananan = () => {
    let jmlPriceId = [document.querySelectorAll('#inputPrice')]
    let newJmlPriceId = [...jmlPriceId[0]]
    let arrayPrice = []
    let jmlQty = [document.querySelectorAll('#quantityInput')]
    let newJmlQty = [...jmlQty[0]]
    let arrayQty = []
    
    newJmlPriceId.forEach(val => arrayPrice.push(Number(val.value)))
    newJmlQty.forEach(val => arrayQty.push(~~val.value))
    
    console.log({price:arrayPrice,qty:arrayQty})
    let sumBiaya = 0
    let arrSum = []
    sumBiaya += arrayPrice.map((num,idx) => num * arrayQty[idx]).reduce((acc,curr) => acc + curr,0)
    
    document.getElementById('totalBiaya').value = sumBiaya
    document.getElementsByClassName('totalBiaya').value = sumBiaya
}
function logout  () {
    console.log('ini event logout')
    fetch('/dashboard/logout',
    {
        method: 'DELETE',
        
    })
    .then(location.reload())
    .catch(e => {
        console.log(e)
    })
}

const editUser = (id) => {
    alert(id)
    console.log(id)
    fetch(`/users/${id}`, 
    { 
        method: 'PATCH',
    })
    .then(location.reload())
    .catch(e => console.log(e))
}

function removeUser(id) {
    fetch(`/users/${id}`, 
    {
        method: 'DELETE',
    })
    .then(location.reload())
    .catch(e => {
        console.log('error catch')
    })
}
// function itungan(){
//     console.log('tes')
//     let totalPrice = document.getElementById('total')
//     let uang = document.getElementById('uang')
//     let jujul = document.getElementById('kembalian')

//     let uangKembalian = Number(uang) - Number(totalPrice.value)
//     document.getElementById('kembalian').value = jujul
//     console.log(jujul,uang,totalPrice, uangKembalian)
// }
let el = document.getElementById('wrapper')
// let toggleButton = document.getElementById('menu-toggle')

// toggleButton.onclick = function () {
//     el.classList.toggle('toggled')
// }
// document.getElementById('closeBtn').addEventListener("click",() => {
//     let frame = document.getElementById('iframe')
//     frame.remove()
// })

