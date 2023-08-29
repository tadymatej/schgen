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

    def getSubjectStudiumYear(self):
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
    def CreateJsonObjPropStr(self, name, subProperites):
        """
        Vytvoří řetězec který odpovídá objektu vloženému do třídy jako prvek
        Arguments
        ---------
        name - název objektu
        subProperties - pole vlastností objektu 
        """
        return "{"+self.CreateJsonStr(name)+":{"+(",".join(subProperites))+"}}"
    def CreateJsonValPropertyStr(self, name, value, asStr):
        """
        Vytvoří řetězec odpovídající vlastnosti objektu
        Arguments
        ---------
        name - název vlastnosti
        value - hodnota
        asStr - jestli nad hodnotou value je nutno aplikovat funkce CreateJsonStr
        """
        return self.CreateJsonStr(name)+": "+ (self.CreateJsonStr(value) if asStr else value)

    def CreateStudiumJson(self, studiumName, studyFocuses = []):
        """
        Vrácí řetezec odpovídající jednomu studiu
        Format řetězce
        {"studium":{"name": "","studiumFocuses":[],"type": 0}}
        Arguments
        ---------
        studiumName - nazev studijního programu (zkrátka)
        styduFocuses - seznam specializaci studijního programu
        """
        studiumType = 1
        if studiumName == "BIT" or "IT-BC" in studiumName:
            studiumType = 0
        elif "DIT" in studiumName or studiumName == "VTI-DR-4":
            studiumType = 2
        
        json = self.CreateJsonObjPropStr("studium",
                    [   
                        self.CreateJsonValPropertyStr("name", studiumName, True), 
                        self.CreateJsonArrStr("studiumFocuses", map(lambda str: self.CreateJsonStr(str), studyFocuses)),
                        self.CreateJsonValPropertyStr("type", str(studiumType), False)
                    ]
            )
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
print("\"studiums\":[")
#Nactu do studiumDict všechny studia a jejich zaměření
dd = DataDownloader(driver)
studiumsDict = dict()
for url in urls:
    driver.get(url)
    results = dd.getSubjectStudiumYear()
    for res in results:
        if(res[0] not in studiumsDict):
            studiumsDict[res[0]] = []
        for item in res[1]:
            if item not in studiumsDict[res[0]]:
                studiumsDict[res[0]].append(item)

i = 0
result = []
#Tvorba listu JSON řetězců studijních programů
for key, value in studiumsDict.items():
    i += 1
    result.append(dd.CreateStudiumJson(key, value))

print(",".join(result))

print("]}")
testingPage.closePage()

