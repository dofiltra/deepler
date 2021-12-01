/* tslint:disable:no-console */
import { Deepler } from '.'
import { GTransApi } from './services/gtrans/api'

const debug = async () => {
  const ruTexts = [
    `Генеральный секретарь НАТО Йенс Столтенберг также повторил свой призыв к России провести «деэскалацию» наращивания военной мощи у границы с Украиной и предупредил о «последствиях» в случае применения силы.`,

    `Заявления Столтенберга и главы Европейской комиссии Урсулы фон дер Ляйен прозвучали накануне встречи министров иностранных дел стран НАТО, включая госсекретаря США Энтони Блинкена, которая пройдет в Латвии на этой неделе.  `,

    `Столтенберг и фон дер Ляйен обвинили Беларусь в организации кризиса с мигрантами на границе, представляющего «гибридную» угрозу ЕС. Режим в Минске отверг эти обвинения. `,

    `Под гибридной угрозой понимается вызов безопасности, сочетающий традиционные военные средства и невоенную тактику, например, дезинформацию.`,

    `«Чтобы реагировать на такие события, важно, чтобы Европейский Союз и НАТО работали рука об руку», – заявила фон дер Ляйен на совместной пресс-конференции со Столтенбергом и литовскими лидерами в Вильнюсе.`,

    `«Мы обсудили возможности активизации совместной работы НАТО и ЕС», – сказал Столтенберг.`,

    `Фон дер Ляйен также сообщила, что ЕС решил увеличить в три раза расходы на пограничный контроль в Латвии, Литве и Польше на 2021-2022 годы, доведя их до 200 миллионов евро.`,

    `По ее словам, эти деньги пойдут на патрульные автомобили и электронное наблюдение, включая беспилотники.`,

    `За последние месяцы тысячи мигрантов, в основном из стран Ближнего Востока, пересекли или пытались пересечь границу Беларуси с Латвией, Литвой и Польшей, которые входят в ЕС и НАТО.`,

    `Комментируя ситуацию на границе с Беларусью, президент Литвы Гитанас Науседа заявил, что «если обстановка ухудшится, мы не исключаем проведения консультаций, предусмотренных статьей 4» Североатлантического договора.`,

    `В соответствии с этой статьей любой член НАТО может созвать встречу альянса для консультаций, если почувствует угрозу своей безопасности.`,

    `Латвия нуждается в постоянном военном присутствии США для сдерживания России и хочет укрепить свою оборону с помощью американских ракет Patriot, заявил министр обороны Артис Пабрикс в ходе визита главы НАТО в страну.
«Нам нужна дополнительная международная помощь, – заявил Пабрикс. – Мы хотели бы иметь постоянное (военное) присутствие Соединенных Штатов в нашей стране. А морская и противовоздушная оборона, по сути, предполагает переход на такие системы, как Patriot (ракеты земля-воздух)».

Силы НАТО отрабатывают в лесах Латвии боевые навыки с танками и боевыми патронами. 1500 военнослужащих приняли участие в отражении инсценированной атаки на Ригу, остановив продвижение противника к северу от города.

Ожидается, что в ходе двухдневного совещания министров иностранных дел стран НАТО в Латвии, которое открывается во вторник, будет обсуждаться вопрос о наращивании российского военного присутствия вблизи Украины.

Столтенберг заявил, что «нетипичная» концентрация танков, артиллерии, беспилотников и тысяч военнослужащих в состоянии боеготовности «вызывает большую тревогу по многим причинам», в частности потому, что она «ничем не спровоцирована и необъяснима».

«Послание России заключается в том, что она должна провести деэскалацию, снизить напряженность и быть транспарентной», – сказал он, добавив, что «если они решат применить силу, то, конечно же, будут последствия».

«Мы готовы защищать всех наших союзников и мы будем и дальше оказывать нашему партнеру Украине политическую и практическую поддержку», – сказал он.


`
  ]

  const enTexts = [
    ...`As of Wednesday, 152 personnel from the Santa Clarita Valley Sheriff’s Station will be wearing body cameras, with plans to get the remaining few dozen equipped with video equipment by the end of the month.  

  The plan, according to law enforcement officials, is to have more than 200 sworn personnel wearing body cameras by Dec. 9, and the public will be able to request the video through the Los Angeles County Sheriff’s Department’s Public Records Act request process.  
  
  The cameras are set to be on at all times. However, they only begin recording upon a deputy activating a camera per department policy.  
  
  According to Deputy Natalie Arriaga, a spokeswoman for the SCV Sheriff’s Station, deputies began wearing cameras Thanksgiving night after a number of years of the county working to get the program off the ground.  
  
  “In preparation for the opening of the new station on Nov. 18, 2021, the department began training station personnel early,” said Lt. Geoffrey Chadwick of the L.A. County Sheriff’s Department Body Worn Camera Unit. “The first shift the body-worn cameras were active was on Nov. 25, 2021.  
  
  “The reason for the one-week delay was due to the installation of the network required for the cameras to dock and upload their videos,” he added.  
  
  According to Chadwick, each deputy is issued a body-worn camera after attending an eight-hour training class focused on the department’s policies regarding use and accountability. The cameras, upon completion of the class, should be worn on the deputy’s very next shift.  
  
  “The cameras are currently active and being used by Santa Clarita Station,” said Chadwick. “We expect full deployment by Dec. 9, 2021, with the exception of personnel off due to approved leave or for vacant positions.” 
  
  The cameras, Chadwick said, are to be used for all duties including enforcement or investigation, and should be on at all times. The camera recording will be left to the deputy’s discretion and department policy.  
  
  “However, each camera has a buffer mode of 60 seconds, which is added at the beginning of each recording upon activation,” said Chadwick. “At the end of each shift, the employee will dock their cameras to upload their videos into a digital evidence management system.” 
  
  “If the cameras are not activated per policy, the station will take action to correct the behavior to include counseling, documentation and potentially discipline,” he said.  
  
  The department has said in the past, and Chadwick reiterated on Tuesday, they believe the body-worn camera program will allow deputies and the department an opportunity to review their “performance following critical incidents, reduce force and complaints, reduce allegations of misconduct, showcase exemplary work, and provide additional evidence in criminal matters.” 
  
  `.split('\n')
  ]

  const gTranslateResultEn = await Promise.all(
    enTexts.map(async (t) =>
      new GTransApi({}).translate({
        targetLang: 'RU',
        text: t
      })
    )
  )
  debugger

  const gTranslateResult = await Promise.all(
    ruTexts.map(async (t) =>
      new GTransApi({}).translate({
        targetLang: 'EN',
        text: t
      })
    )
  )
  // debugger
  // const fetchResult = await new DeeplFetch({
  //   headless: false,
  //   proxies: [
  //     new ProxyItem({
  //       type: 'socks5',
  //       ip: '',
  //       port: '11018',
  //       user: '',
  //       pass: '',
  //       changeUrl: 'http://node-us-6.astroproxy.com:11017/api/changeIP?apiToken='
  //     } as ProxyItem)
  //   ]
  // }).translate({
  //   targetLang: 'EN',
  //   text: texts[0]
  // })
  // console.log(texts.length)

  const a = await Promise.all(
    ruTexts.map(async (t) => {
      const translateResult = await new Deepler({
        maxInstanceCount: 1,
        maxInstanceUse: 3,
        headless: false
      }).translate({
        text: t,
        targetLang: 'EN',
        tryLimit: 10
      })

      console.log(t, translateResult)

      return { translateResult, text: t }
    })
  )
  // debugger
  // console.log(a)
}

debug()
