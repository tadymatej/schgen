"""
Authors: Matěj Žalmánek (xzalma00), Igar Sauchnka(xsauch00)
"""
from typing import List
from selenium import webdriver
from selenium.webdriver.common import keys
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.touch_actions import TouchActions
import unittest
import time
import re

"""
Author: Matěj Žalmánek (xzalma00)
"""
class TestingPage:
    """
    Třída obsahující informace o driveru testované stránky, stará se o otevření webu, přihlášení se na web...
    """
    def getDriverWebPage(self):
        """
        Vrátí otevřený driver stránky
        """
        return self.driverWebPage

    def __init__(self, url, needsLogin, browser , driverExecutablePath):
        """
        Inicializuje stránku, neotevře
        Arguments
        ---------
        url - adresa stránky, která se má otevřít
        needsLogin - bool, označující, zda se musí přihlásit na web
        browser - Typ prohlížeče z množiny: {"Firefox", "Chrome"}
        driverExecutablePath - Cesta k otevření driveru
        """
        self.url = url
        self.needsLogin = needsLogin
        self.loggedIn = False
        if(browser == "Firefox"): self.driverWebPage= webdriver.Firefox(executable_path=driverExecutablePath)
        elif(browser == "Chrome"): self.driverWebPage= webdriver.Chrome(executable_path=driverExecutablePath)
    
    def logIn(self, loggingPage, email, password, submitValueButton): #type: (TestingPage, str, str, str, WebElement) -> None
        """
        Přihlášení se na web
        Arguments
        ---------
        loggingPage - stránka, na které je přihlašovací formulář (url)
        email - email, na který se má přihlásit
        password - heslo k emailu
        submitValueButton - WebElement určující, které tlačítko submituje formulář
        """
        self.loggedIn=True
        self.driverWebPage.get(loggingPage)
        emailField = self.driverWebPage.find_element(by=By.ID, value="email-login") #type: WebElement
        emailField.send_keys(email)
        passwordField = self.driverWebPage.find_element(by=By.ID, value="heslo-login") #type: WebElement
        passwordField.send_keys(password)
        submitField = self.driverWebPage.find_element(by=By.XPATH, value=submitValueButton)  #type: WebElement
        submitField.click()

    def openPage(self, *args):
        """
        Otevře webovou stránku, v případě potřeby provede i přihlášení
        Arguments
        ---------
        args = email, heslo, textButtonuSubmit
        """
        if(self.needsLogin): 
            if(len(args) < 4): return 
            self.logIn(args[0], args[1], args[2], args[3])
        self.driverWebPage.get(self.url)

    def closePage(self):
        """
        Ukončí a uzavře otevřenou stránku
        """
        self.driverWebPage.close()


"""
Author: Igar Sauchnka(xsauch00)
"""
class DataDownloader:
    """
    Třída, která stahuje s webu fakulty data o předmětéch
    """
    def __init__(self, driver):
        """
        Inicializuje třídu. Ukládá otevřený driver stranky
        Arguments
        ---------
        driver - otevřený driver stranky
        """
        self.driver = driver

    def getSubjectName(self):
        """
        Vrátí jmeno předmětu
        """
        return self.driver.find_element_by_xpath("//h1[@class='b-detail__title']").get_attribute("innerHTML")
    
    def getSubjectCode(self):
        """
        Vrátí zkratku předmětu
        """
        return self.driver.find_element_by_xpath("//span[@class='b-detail__annot-item font-bold' and @itemprop='courseCode']").get_attribute("innerHTML")
    
    def getSubjectSemester(self):
        """
        Vrátí číselnou hodnotu, která odpovídá semestru, ve kterém je předmět výučován
        1 - letní semestr
        2 - zimní
        """
        semester = self.driver.find_element_by_xpath("//span[@class='b-detail__annot-item font-bold' and contains(text(),'semestr')]").get_attribute("innerHTML")
        if("letní" in semester):
            return 1
        elif("zimní" in semester):
            return 0
    
    def getSubjectLectures(self):
        """
        Vrátí informace o terminéch předmětu uložené v poli
        Položka poli se skládá z:
        Pozice  Obsah
        [0]     Druh termínu (přednáška, cvíčení atd)
        [1]     Týden výuky
        [2]     Účebna
        [3]     Časy ve kterých termín probíhá (den týdnu = [3] mod 24 (0 .. 4)(Po .. Pá), časy, kdy probíhá = { [3] div 24 })
        [4]     Výučující
        """
        res = []
        rows = self.driver.find_elements_by_xpath("//table[@id='schedule']/tbody/tr")
        for row in rows:
            day = row.find_element_by_tag_name("th")
            day = day.get_attribute("innerText")
            cols = row.find_elements_by_tag_name("td")
            if(cols[0].get_attribute("innerText") == "ostatní" or cols[0].get_attribute("innerText") == "zkouška"):
                continue
            subres = []
            subres.append(cols[0].get_attribute("innerText"))
            subres.append(cols[1].get_attribute("innerText"))
            subres.append(cols[2].get_attribute("innerText"))

            times = []
            multiply = 0
            if day == "Út":
                multiply = 1
            elif day == "St":
                multiply = 2
            elif day == "Čt":
                multiply = 3
            elif day == "Pá":
                multiply = 4
            timeBase = 24 * multiply
            
            start = int(cols[3].get_attribute("innerHTML").split(":")[0])
            end = int(cols[4].get_attribute("innerText").split(":")[0]) + 1
            while(start < end):
                times.append(start - 1 + timeBase)  
                start += 1
            subres.append(times)
            subres.append(cols[7].get_attribute("innerText"))
            res.append(subres)
        return res

    def getSubjectStudiumYearAndObligatory(self):
        """
        Vrátí informace o předmětu v polí
        Položka poli se skládá z:
        Pozice  Obsah
        [0]     Název studijníhho, kde je předmět výučovan(zkrátka)
        [1]     Pole specializací studijního programu
        [2]     Ročník, ve kterém je předmět výučovan
        [3]     Povinnost předmětu (0 - povinný, 1 - volitelný, povinně volitelný - záleží na ASCII hodnote posledního znaků v zkratce )
        """
        try:
            res = self.driver.find_elements_by_xpath("//div[@class='b-detail__content']/ul")[-1]
            res = res.find_elements_by_tag_name("li")
            toReturn = []
            if(res[0].get_attribute("innerText")[0:8] != "Program "):
                return ""
            for r in res:
                lines = r.get_attribute("innerText").split(",")
                i = 1
                tr = []
                tr.append(lines[0].strip().replace("Program ", ""))
                tr2 = []
                while(i < len(lines) - 2):
                    tr2.append(lines[i].strip().replace("obor ", "").replace("specializace ", ""))
                    i += 1
                tr.append(tr2)
                tr.append(lines[-2].strip())
                obligatory = lines[-1].strip()
                if "povinný" in obligatory:
                    tr.append(0)
                elif "povinně volitelný" in obligatory:
                    tr.append([2, obligatory[-1]])
                elif "volitelný" in obligatory:
                    tr.append(1)
                else:
                    tr.append(-1)   #-1 means obligatory was not found
                toReturn.append(tr)
            return toReturn
        except:
            return ""

    def CreateJsonStr(self, str):
        """
        Vrátí řetězec pro vložení do JSON souboru
        Fakticky přidává na začetek i na konec řetězce "
        Arguments
        ---------
        str - řetězec, který bude přetransformovan do vhodného formátu
        """
        return "\""+str+"\""
    def CreateJsonArrStr(self, name, values):
        """
        Vrátí řetězec odpovidjící poli prvků pro vložení do JSON souboru
        Arguments
        ---------
        name - název poli
        values - pole hodnot tohoto polí
        """
        return self.CreateJsonStr(name)+":["+(",".join(values))+"]"
    def CreateJsonObjPropStr(self, name, subProperties, isAnonymous):
        """
        Vytvoří řetězec který odpovídá objektu vloženému do třídy jako prvek
        Arguments
        ---------
        name - název objektu
        subProperties - pole vlastností objektu 
        isAnonymous - jestli objekt má nazev, nebo je anonymný (nápř. prvek v polí) (True - nemá název)
        """
        return ("" if isAnonymous else "{"+self.CreateJsonStr(name)+":")+"{"+(",".join(subProperties))+("}" if isAnonymous else "}}")
    def CreateJsonValPropertyStr(self, name, value, asStr):
        """
        Vytvoří řetězec odpovídající vlastnosti objektu
        Arguments
        ---------
        name - název vlastnosti
        value - hodnota
        asStr - jestli nad hodnotou value je nutno aplikovat funkce CreateJsonStr
        """
        return self.CreateJsonStr(name)+":"+ (self.CreateJsonStr(value) if asStr else value)

    def CreateSubjectJson(self):
        """
        Vrácí řetezec odpovídající jednomu předmětu
        Format
        {"subject":{"studiums":[{"studiumName":"","studiumFocuses":[],"year":"","obligatory":1, ...],"semestr":0,
        "name":"","code":"","terms":[{"type":"","teachingAt":"","times":[8, ...],"classroom":"","teacher":""}]}}
        """
        subjectName = self.getSubjectName()
        subjectCode = self.getSubjectCode()
        semester = self.getSubjectSemester()

        studiums = self.getSubjectStudiumYearAndObligatory() 
        terms = self.getSubjectLectures()

        json = self.CreateJsonObjPropStr("subject", [
            self.CreateJsonArrStr("studiums",
                    map(lambda st: self.CreateJsonObjPropStr("",[
                        self.CreateJsonValPropertyStr("studiumName", st[0], True),
                        self.CreateJsonArrStr("studiumFocuses", map(lambda foc: "\""+foc+"\"",st[1])),
                        self.CreateJsonValPropertyStr("year", st[2], True),
                        self.CreateJsonValPropertyStr("obligatory",
                             str(ord(st[3][1])) if isinstance(st[3], list) else str(st[3]), False)
                    ], True),
                studiums)),
            self.CreateJsonValPropertyStr("semester", str(semester), False),
            self.CreateJsonValPropertyStr("name", subjectName, True),
            self.CreateJsonValPropertyStr("code", subjectCode, True),
            self.CreateJsonArrStr("terms", map(lambda t: self.CreateJsonObjPropStr("",[
                    self.CreateJsonValPropertyStr("type", t[0], True),
                    self.CreateJsonValPropertyStr("teachingAt", t[1], True),
                    self.CreateJsonArrStr("times", map(lambda tt: str(tt), t[3])),
                    self.CreateJsonValPropertyStr("classroom", t[2], True),
                    self.CreateJsonValPropertyStr("teacher", t[4], True)
                ],True)

            ,terms))
        ], False)

        return json

        


#Otevírání stranky
testingPage = TestingPage("https://www.fit.vut.cz/study/courses/.cs", False , "Firefox", "/usr/bin/geckodriver")
testingPage.openPage()
driver = testingPage.getDriverWebPage()

table = driver.find_elements_by_xpath("//table[@id='list']//a[@class='list-links__link']")

#Ukládání odkazů na předměty
urls = []
for item in table:
    urls.append(item.get_attribute("href"))

print("{")
print("\"subjects\":[")
i = 0
result = []
#Tvorba listu JSON řetězců předmětů
for url in urls:
    i += 1
    driver.get(url)
    dd = DataDownloader(driver)
    result.append(dd.CreateSubjectJson())

print(",\n".join(result))
print("]}")
testingPage.closePage()