import "./style/colors.css"
import "./style/style.css"
import "./app.css"

const baseEl = document.createElement("base")
baseEl.href = window.location.origin
document.head.appendChild(baseEl)

import "@app/services/firebaseInit"
import "./app"

import "@app/views/homeView"
import "@app/views/aboutView"
import "@app/views/municipalityView"
import "@app/views/notFound"

import "@app/components/calendarWidget"
import "@app/components/monthDays"
import "@app/components/garbageTypeInfo"
import "@app/components/garbageTypeIcon"
import "@app/components/searchForm"
import "@app/components/titleLine"
import "@app/components/calendarDay"
import "@app/components/subscriptionList"

import "@app/components/toast"
import "@app/components/icons/WorkingIcon"
import "@app/routing/index"

import { materialIconsStyle } from "@app/style/stylesheets"
import { gotoPath } from "@app/routing/router"
const styleEl = document.createElement("style")
const codeEl = document.createTextNode(materialIconsStyle)
styleEl.appendChild(codeEl)
document.head.appendChild(styleEl)

gotoPath(window.location.pathname)