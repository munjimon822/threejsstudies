import _ from 'lodash';
import './style.css';

const indexBox = document.createElement("div")
indexBox.setAttribute("id", "index-box")
document.body.appendChild(indexBox)

const title = document.createElement("h1")
title.setAttribute("id", "title")
title.innerText = "Three.js 스터디 코드 모음"
indexBox.appendChild(title)

const weeks = [
  "움직이는 큐브들",
  "여러 원시모델 쇼케이스"
]

const weekBox = document.createElement("div")
weekBox.setAttribute("id", "week-box")
indexBox.appendChild(weekBox)

weeks.forEach((weekTitle, wi) => {
  const linkbox = document.createElement("div")
  const link = document.createElement("a")
  link.innerText = weekTitle
  link.href = `week${wi+1}.html`
  linkbox.appendChild(link)
  weekBox.appendChild(linkbox)
});