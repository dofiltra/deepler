/* tslint:disable:no-console */
/* tslint:disable:no-debug */
import { RewriteMode } from 'dprx-types'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { Dotransa } from '.'
import { TransType } from './types/trans'

const debug = async () => {
  const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  dotenv.config({ path: path.join(rootPath, `.env`) })

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

  const dotransa = await Dotransa.build([
    {
      maxPerUse: 1000,
      maxInstance: 1,
      headless: false,
      type: TransType.DeBro
    }
  ])

  const translateResult1 = await dotransa.translate({
    text: `Если 2021 год был годом NFT, то следующим горячим трендом криптоиндустрии могут стать блокчейн-игры и метавселенные об этом говорит стремительный рост соответствующих проектов в последние месяцы.
    
    В результате серии торнадо в штате погибли 74 человека, более 100 числятся пропавшими без вести

Президент США Джо Байден в среду посещает штат Кентукки, чтобы лично оценить ущерб от серии торнадо, в результате которых погибли не менее 74 человек.

В ходе визита Байден ознакомится с последней информацией о ликвидации последствий ударов стихии, которые обрушились на штат в пятницу и субботу, и посетит два пострадавших от торнадо города – Мэйфилд и Доусон-Спрингс.

В пятый раз с момента вступления в должность менее года назад президент Джо Байден берет на себя мрачную задачу - посетить район, разрушенный стихийным бедствием, чтобы высказать слова утешения и соболезнования.

«Сегодняшнее послание президента состоит в том, что он и федеральное правительство намерены делать все, что потребуется, и (потратить) столько времени, сколько потребуется, предоставляя любую поддержку, которая необходима для содействия усилиям по восстановлению и для помощи жителям Кентукки и других пострадавших штатов». Об этом на борту президентского самолета Air Force One заявила в среду первый заместитель пресс-секретаря Белого дома Карин Жан-Пьер.

Губернатор Кентукки Энди Бешир во вторник заявил, что в штате пропали без вести более 100 человек. Большинство пропавших проживали в городе Доусон-Спрингс, население которого составляет менее 3000 человек.

Пресс-секретарь Белого дома Джен Псаки во вторник заявила журналистам, что Байден «хочет напрямую пообщаться с людьми и напрямую предложить им свою поддержку».

«Завтра он постарается напрямую донести до них следующую мысль: "Мы здесь, чтобы помочь в восстановлении, мы будем рядом с вами и поможем вашим лидерам сделать именно это"», – сказала Псаки.

Байден объявил режим чрезвычайной ситуации в Кентукки и соседних штатах Теннесси и Иллинойс после того, как штормы принесли более 30 торнадо в пять штатов. Всего погибло как минимум 88 человек.


    `,
    targetLang: 'EN',
    tryLimit: 10,
    mode: RewriteMode.Longer
  })

  const translateResult2 = await dotransa.translate({
    text: translateResult1.translatedText,
    // `If 2021 was the year of NFT, then the next hot trend in the crypto-industry could be blockchain games and meta-villages, as evidenced by the rapid growth of the respective projects in recent months. A series of tornadoes in the state has killed 74 people, and more than 100 are unaccounted for U.S. President Joe Biden is visiting Kentucky Wednesday to personally assess the damage from a series of tornadoes that have killed at least 74 people. During his visit, Biden will get an update on the aft…s Tuesday that Biden "wants to talk directly to people and offer his support directly to them." "Tomorrow he will try to communicate to them directly the following message: 'We are here to help in the recovery, we will be there for you and we will help your leaders do just that,'" Psaki said. Biden declared a state of emergency in Kentucky and neighboring states of Tennessee and Illinois after storms brought more than 30 tornadoes to the five states. A total of at least 88 people were killed.`,
    targetLang: 'RU',
    tryLimit: 10,
    mode: RewriteMode.Longer
  })

  debugger

  const arr: any[] = []
  for (let i = 0; i < 1000; i++) {
    arr.push(
      ...[
        ...ruTexts
          .filter((t) => t?.trim())
          .map(async (t) => {
            const translateResult = await dotransa.translate({
              text: t + ' ' + Math.random(),
              targetLang: 'EN',
              tryLimit: 10
            })

            // console.log(++counter, t.slice(0, 30), ' --> ', translateResult?.translatedText?.slice(0, 30))

            return { translateResult, text: t }
          }),

        ...enTexts
          .filter((t) => t?.trim())
          .map(async (t) => {
            const translateResult = await dotransa.translate({
              text: t + ' ' + Math.random(),
              targetLang: 'RU',
              tryLimit: 1
            })

            // console.log(++counter, t.slice(0, 30), ' --> ', translateResult?.translatedText?.slice(0, 30))

            return { translateResult, text: t }
          })
      ]
    )
  }

  const a = await Promise.all(arr)
  // debugger
  // console.log(a)
}

debug()
