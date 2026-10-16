// Client messages sent by the team space (admin.html), one per finished step, in French and Darija.
// {placeholders} are filled from the file; a line whose placeholder is empty (e.g. {suivi} while there is no
// client tracking page) is left out. Edit the texts here: admin.html picks them up as they are.
window.CE_MSG = (() => {
  const PAY_INFO = {
    virement: { fr:'Virement bancaire\nBénéficiaire : CHARIKA EXPRESS SARL AU\nRIB Attijariwafa bank : 007 121 0013173300310011 77\nRIB CIH Bank : 230 010 6955764211018700 79', ar:'تحويل بنكي\nالمستفيد: CHARIKA EXPRESS SARL AU\nRIB التجاري وفا بنك: 007 121 0013173300310011 77\nRIB CIH Bank: 230 010 6955764211018700 79' },
    cashplus: { fr:'Cash Plus\nN° de compte : 0667154604', ar:'Cash Plus\nرقم الحساب: 0667154604' }
  };
  const SUIVI_URL = 'https://charikaexpress.ma/suivi.html';   // client tracking page; the team space adds ?ref=<reference>
  // added to the « documents à légaliser » message when the capital is above 100 000 MAD (bank attestation needed)
  const BLOCAGE = { fr:"Votre capital dépassant 100 000 MAD, merci de le déposer sur un compte bloqué à la banque et de nous envoyer l'attestation de blocage.", ar:'بما أن الرأسمال ديالكم فايت 100.000 درهم، من فضلكم حطوه فحساب مجمد فالبنك وصيفطو لينا شهادة التجميد (Attestation de blocage).' };
  const SIG = { fr:"\n\nAvec nos salutations les plus cordiales,\nL'équipe Charika Express\nVotre société au Maroc, 100 % en ligne", ar:"\n\nمع أطيب التحيات،\nفريق Charika Express\nالشركة ديالكم فالمغرب، 100% أونلاين" };
  const MSG = {
    // sent by hand from the score card to a new request that is not confirmed yet
    confirmer: {
      "n": "0",
      "title": "Demande à confirmer",
      "fr": {
        "wa": "Bonjour {prenom} 👋\nC'est {moi}, votre juriste chez Charika Express. Nous avons bien reçu votre demande de création de *{societe}* (réf. {ref}), merci pour votre confiance !\n\nAvant de lancer les démarches, pouvez-vous simplement nous confirmer que vous souhaitez démarrer ? Répondez *OUI* à ce message et nous réservons tout de suite votre dossier.\n\nUne question sur les étapes, les tarifs ou les documents ? Écrivez-nous ici, nous vous répondons rapidement. 😊",
        "subj": "Votre demande {ref} : une simple confirmation pour démarrer",
        "mail": "Bonjour {prenom},\n\nMerci d'avoir choisi Charika Express pour créer {societe}. Votre demande est bien enregistrée sous la référence {ref}.\n\nAvant de lancer les démarches, nous avons simplement besoin de votre confirmation : répondez « OUI » à cet e-mail (ou sur WhatsApp), et votre juriste dédié réserve immédiatement votre dossier.\n\nUne question sur les étapes, les délais ou les documents à fournir ? Répondez à ce message : nous serons ravis de vous accompagner.\n\nÀ très bientôt,{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom} 👋\nمعاكم {moi}، المستشار القانوني ديالكم فـ Charika Express. توصلنا بالطلب ديالكم باش نأسسو *{societe}* (المرجع {ref})، شكرا على الثقة!\n\nقبل ما نبداو الإجراءات، واش تقدرو تأكدو لينا بلي باغيين تبداو؟ جاوبو بـ *نعم* على هاد الرسالة ونحجزو الملف ديالكم ديريكت.\n\nإلا عندكم شي سؤال على المراحل، الأثمنة ولا الوثائق، كتبو لينا هنا ونجاوبوكم بسرعة. 😊",
        "subj": "الطلب ديالكم {ref}: غير تأكيد صغير باش نبداو",
        "mail": "السلام عليكم ورحمة الله {prenom}،\n\nشكرا حيت ختارتو Charika Express باش تأسسو {societe}. الطلب ديالكم تسجل تحت المرجع {ref}.\n\nقبل ما نبداو الإجراءات، خاصنا غير التأكيد ديالكم: جاوبو بـ « نعم » على هاد الإيميل (ولا فالواتساب)، والمستشار القانوني ديالكم يحجز الملف ديالكم ديريكت.\n\nإلا عندكم شي سؤال على المراحل، المدة ولا الوثائق اللي خاصكم توجدو، جاوبو على هاد الرسالة: متشرفين نعاونوكم.\n\nإلى اللقاء قريبا،{sig}"
      }
    },
    recu: {
      "n": "1",
      "title": "Demande reçue",
      "fr": {
        "wa": "Bonjour {prenom} 👋\nToute l'équipe Charika Express vous remercie pour votre confiance ! Votre demande de création de *{societe}* (réf. {ref}) est bien enregistrée.\n\nVotre projet est entre de bonnes mains : un juriste dédié vous accompagne à chaque étape, jusqu'à la remise de tous vos documents.\n\nPour lancer votre dossier dès aujourd'hui, il vous suffit de régler l'avance de *700 MAD* :\n{paiement}\n\nDès réception, nous démarrons le certificat négatif. Au plaisir de vous accompagner ! 🚀",
        "subj": "Bienvenue chez Charika Express : votre projet {societe} est lancé",
        "mail": "Bonjour {prenom},\n\nNous vous remercions sincèrement d'avoir choisi Charika Express pour créer {societe} ({forme}, {pack}). Votre demande est bien enregistrée sous la référence {ref}.\n\nCréer sa société est une étape importante, et nous sommes fiers de la vivre à vos côtés. Avec nous, plus besoin de courir les administrations : votre juriste dédié s'occupe de toutes les démarches, et vous suivez l'avancement en temps réel.\n\nPour lancer votre dossier, il vous suffit de régler l'avance de 700 MAD :\n{paiement}\nMerci d'indiquer la référence {ref} dans le motif du virement.\n\nDès réception, nous déposons la demande de certificat négatif à l'OMPIC afin de réserver le nom de votre société.\n\nSuivez votre dossier à tout moment : {suivi}\n\nNous restons à votre entière disposition pour toute question.{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom} 👋\nفريق Charika Express كيشكركم بزاف على الثقة ديالكم! الطلب ديالكم باش نأسسو *{societe}* (المرجع {ref}) تسجل عندنا.\n\nالمشروع ديالكم فأيادي أمينة: مستشار قانوني خاص بيكم غادي يكون معاكم فكل خطوة، حتى توصلكم جميع الوثائق.\n\nباش نبداو الملف ديالكم من اليوم، غير خلصو التسبيق ديال *700 درهم*:\n{paiement}\n\nغير نتوصلو بيه، كنبداو ديريكت فالشهادة السلبية. متشرفين نخدمو معاكم! 🚀",
        "subj": "مرحبا بيكم فـ Charika Express: المشروع ديالكم {societe} بدا",
        "mail": "السلام عليكم ورحمة الله {prenom}،\n\nكنشكروكم من القلب حيت ختارتو Charika Express باش تأسسو {societe} ({forme}، {pack}). الطلب ديالكم تسجل تحت المرجع {ref}.\n\nتأسيس الشركة خطوة مهمة، وحنا فرحانين نكونو معاكم فيها. معانا، ما بقاش خاصكم تدورو على الإدارات: المستشار القانوني ديالكم كيتكلف بجميع الإجراءات، ونتوما كتتبعو الملف لحظة بلحظة.\n\nباش نبداو الملف، غير خلصو التسبيق ديال 700 درهم:\n{paiement}\nمن فضلكم كتبو المرجع {ref} فسبب التحويل.\n\nغير نتوصلو بيه، كنديرو طلب الشهادة السلبية فـ OMPIC باش نحجزو الإسم ديال الشركة ديالكم.\n\nتقدرو تتبعو الملف ديالكم فأي وقت من هنا: {suivi}\n\nحنا رهن الإشارة لأي سؤال.{sig}"
      }
    },
    avance: {
      "n": "2",
      "title": "Avance reçue",
      "fr": {
        "wa": "Bonjour {prenom}, nous avons bien reçu votre avance de 700 MAD. Merci infiniment ✅\n\nVotre dossier est officiellement lancé ! Nous avons déposé la demande de certificat négatif pour réserver le nom « {societe} ». Nous vous informerons dès sa délivrance.\n\nSuivez chaque étape en temps réel : {suivi}",
        "subj": "C'est parti ! Votre dossier {ref} est lancé",
        "mail": "Bonjour {prenom},\n\nNous vous confirmons la bonne réception de votre avance de 700 MAD et vous en remercions.\n\nVotre dossier est officiellement lancé. Nous avons déposé la demande de certificat négatif auprès de l'OMPIC : ce document confirme que le nom « {societe} » est disponible et le réserve exclusivement pour vous.\n\nNous vous écrirons dès sa délivrance. En attendant, vous pouvez suivre chaque étape en temps réel : {suivi}\n\nMerci encore pour votre confiance.{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom}، توصلنا بالتسبيق ديال 700 درهم. شكرا بزاف ✅\n\nالملف ديالكم بدا رسميا! درنا طلب الشهادة السلبية باش نحجزو الإسم « {societe} ». غادي نعلموكم غير تخرج.\n\nتبعو كل خطوة لحظة بلحظة: {suivi}",
        "subj": "يالاه بدينا! الملف ديالكم {ref} انطلق",
        "mail": "السلام عليكم {prenom}،\n\nكنأكدو ليكم بلي توصلنا بالتسبيق ديال 700 درهم، وكنشكروكم عليه.\n\nالملف ديالكم بدا رسميا. درنا طلب الشهادة السلبية (Certificat négatif) فـ OMPIC: هاد الوثيقة كتأكد بلي الإسم « {societe} » متوفر وكتحجزو ليكم بوحدكم.\n\nغادي نكتبو ليكم غير تخرج. وفهاد الوقت، تقدرو تتبعو كل خطوة لحظة بلحظة: {suivi}\n\nشكرا مرة أخرى على الثقة ديالكم.{sig}"
      }
    },
    cn: {
      "n": "3",
      "title": "Certificat négatif obtenu",
      "fr": {
        "wa": "Excellente nouvelle {prenom} 🎉\nLe certificat négatif est délivré : le nom *« {societe} »* est désormais réservé pour vous !\n\nVotre juriste rédige dès maintenant vos documents sur mesure : statuts, contrat de domiciliation, procuration, déclaration sur l'honneur et formulaire RC. Vous les recevrez très prochainement.",
        "subj": "Félicitations, le nom « {societe} » est à vous !",
        "mail": "Bonjour {prenom},\n\nNous avons le plaisir de vous annoncer que le certificat négatif est délivré. Le nom « {societe} » est désormais réservé pour votre société : c'est la première pierre de votre projet !\n\nVotre juriste rédige maintenant vos documents, sur mesure et dans le respect de la loi :\n• les statuts\n• le contrat de domiciliation\n• la procuration\n• la déclaration sur l'honneur\n• le formulaire RC (déclaration d'immatriculation)\n\nVous les recevrez très prochainement en PDF sur WhatsApp, accompagnés d'instructions simples pour la légalisation.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "خبر زوين {prenom} 🎉\nخرجات الشهادة السلبية: الإسم *« {societe} »* ولا محجوز ليكم!\n\nالمستشار القانوني ديالكم بدا دابا كيوجد الوثائق ديالكم على حساب المشروع ديالكم: القانون الأساسي، عقد التوطين، الوكالة، التصريح بالشرف والمطبوع ديال السجل التجاري. غادي يوصلوكم قريب إن شاء الله.",
        "subj": "مبروك، الإسم « {societe} » ولا ديالكم!",
        "mail": "السلام عليكم {prenom}،\n\nيسعدنا نخبروكم بلي الشهادة السلبية خرجات. الإسم « {societe} » ولا محجوز للشركة ديالكم: هادي هي أول حجرة فالمشروع ديالكم!\n\nالمستشار القانوني ديالكم كيكتب دابا الوثائق ديالكم، على حساب المشروع ديالكم وطبقا للقانون:\n• القانون الأساسي (Statuts)\n• عقد التوطين (Domiciliation)\n• الوكالة (Procuration)\n• التصريح بالشرف (Déclaration sur l'honneur)\n• مطبوع السجل التجاري (Formulaire RC)\n\nغادي يوصلوكم قريب PDF فالواتساب، مع شرح ساهل ديال المصادقة.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    nomRefus: {
      "n": "3 bis",
      "title": "Nom refusé par l'OMPIC",
      "fr": {
        "wa": "Bonjour {prenom}, l'OMPIC n'a pas accepté le nom « {societe} » pour la raison suivante :\n« {motif} »\n\nPas d'inquiétude, cela arrive souvent 🙂 Envoyez-nous simplement 3 nouveaux noms, par ordre de préférence, ici sur WhatsApp. Nous redéposons la demande dès réception.",
        "subj": "Votre dossier {ref} : choisissons un autre nom",
        "mail": "Bonjour {prenom},\n\nL'OMPIC n'a pas accepté le nom « {societe} » pour le motif suivant :\n« {motif} »\n\nPas d'inquiétude : cela arrive souvent, par exemple quand un nom très proche existe déjà. Il vous suffit de nous proposer 3 nouveaux noms, par ordre de préférence, en répondant à cet e-mail ou sur WhatsApp.\n\nNous redéposons la demande de certificat négatif dès réception.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom}، OMPIC ما قبلش الإسم « {societe} » على هاد السبب:\n« {motif} »\n\nما تقلقوش، هادشي كيوقع بزاف 🙂 غير صيفطو لينا 3 ديال الأسماء جداد، بالترتيب اللي عجبكم، هنا فالواتساب. وغير نتوصلو بيهم كنعاودو نديرو الطلب.",
        "subj": "الملف ديالكم {ref}: نختارو إسم آخر",
        "mail": "السلام عليكم {prenom}،\n\nOMPIC ما قبلش الإسم « {societe} » على هاد السبب:\n« {motif} »\n\nما تقلقوش: هادشي كيوقع بزاف، مثلا ملي كيكون شي إسم قريب بزاف ديجا كاين. غير قترحو علينا 3 ديال الأسماء جداد، بالترتيب اللي عجبكم، وجاوبو على هاد الإيميل ولا فالواتساب.\n\nغير نتوصلو بيهم، كنعاودو نديرو طلب الشهادة السلبية.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    legal: {
      "n": "4",
      "title": "Documents à légaliser + 2e paiement",
      "fr": {
        "wa": "Bonjour {prenom}, vos documents sont prêts ✍️ Nous venons de vous les envoyer en PDF, ici sur WhatsApp :\n• Statuts\n• Contrat de domiciliation\n• Procuration\n• Déclaration sur l'honneur\n• Formulaire RC\n\nIl ne vous reste que 3 petites étapes :\n1. Signer les documents\n2. Faire légaliser votre signature à l'arrondissement (moqataa)\n3. Nous faire parvenir les originaux\n\nPour poursuivre sans délai, nous vous remercions de régler la 2e tranche : *{montant} MAD* (50 % du reste).\n{paiement}\n{blocage}\n\nUne question ? Votre juriste vous répond avec plaisir, ici même.",
        "subj": "Vos documents sont prêts : plus que 3 étapes simples",
        "mail": "Bonjour {prenom},\n\nVotre juriste a finalisé vos documents avec le plus grand soin. Vous les trouverez en pièces jointes :\n• Statuts\n• Contrat de domiciliation\n• Procuration\n• Déclaration sur l'honneur\n• Formulaire RC\n\nIl ne vous reste que 3 étapes simples :\n1. Imprimer et signer chaque document aux endroits indiqués.\n2. Faire légaliser votre signature à l'arrondissement (moqataa), muni de votre CIN en cours de validité.\n3. Nous faire parvenir les originaux légalisés.\n\nPour poursuivre sans délai, nous vous remercions de régler en même temps la deuxième tranche de {montant} MAD (50 % du reste) :\n{paiement}\nMerci d'indiquer la référence {ref} dans le motif du virement.\n{blocage}\n\nDès réception des documents et du paiement, nous lançons l'enregistrement. Si vous avez le moindre doute, appelez-nous ou écrivez-nous sur WhatsApp : nous vous guidons avec plaisir.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom}، الوثائق ديالكم واجدين ✍️ صيفطناهم ليكم دابا PDF هنا فالواتساب:\n• القانون الأساسي (Statuts)\n• عقد التوطين (Domiciliation)\n• الوكالة (Procuration)\n• التصريح بالشرف (Déclaration sur l'honneur)\n• مطبوع السجل التجاري (Formulaire RC)\n\nبقات ليكم غير 3 خطوات ساهلين:\n1. توقعو على الوثائق\n2. تصادقو على التوقيع فالمقاطعة\n3. ترجعو لينا الأصل\n\nباش نكملو بلا تعطال، من فضلكم خلصو الدفعة الثانية: *{montant} درهم* (50% من الباقي).\n{paiement}\n{blocage}\n\nعندكم شي سؤال؟ المستشار ديالكم كيجاوبكم بكل فرح، هنا مباشرة.",
        "subj": "الوثائق ديالكم واجدين: بقات غير 3 خطوات ساهلين",
        "mail": "السلام عليكم {prenom}،\n\nالمستشار القانوني ديالكم وجد الوثائق ديالكم بعناية كبيرة. غادي تلقاوهم مرفقين مع هاد الإيميل:\n• القانون الأساسي (Statuts)\n• عقد التوطين (Domiciliation)\n• الوكالة (Procuration)\n• التصريح بالشرف (Déclaration sur l'honneur)\n• مطبوع السجل التجاري (Formulaire RC)\n\nبقات ليكم غير 3 خطوات ساهلين:\n1. طبعو الوثائق وتوقعو عليهم فالبلايص المحددة.\n2. صادقو على التوقيع فالمقاطعة، وخودو معاكم البطاقة الوطنية صالحة.\n3. رجعو لينا الأصل ديال الوثائق المصادق عليها.\n\nباش نكملو بلا تعطال، من فضلكم خلصو فنفس الوقت الدفعة الثانية ديال {montant} درهم (50% من الباقي):\n{paiement}\nمن فضلكم كتبو المرجع {ref} فسبب التحويل.\n{blocage}\n\nغير نتوصلو بالوثائق والخلاص، كنبداو التسجيل. إلا كان عندكم أي شك، عيطو لينا ولا كتبو لينا فالواتساب: نعاونوكم بكل فرح.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    legalOk: {
      "n": "5",
      "title": "Documents légalisés et paiement reçus",
      "fr": {
        "wa": "Merci beaucoup {prenom} 🙏 Nous avons bien reçu vos documents légalisés ainsi que votre paiement de {montant} MAD ✅\n\nVotre dossier avance très bien ! Nous passons à l'enregistrement des statuts et du contrat de domiciliation. Vous n'avez rien à faire : nous nous occupons de tout.",
        "subj": "Merci ! Votre dossier passe à l'enregistrement",
        "mail": "Bonjour {prenom},\n\nNous avons bien reçu vos documents légalisés ainsi que votre paiement de {montant} MAD. Merci pour votre réactivité !\n\nVotre dossier avance très bien. Nous procédons maintenant à l'enregistrement des statuts et du contrat de domiciliation auprès de l'administration fiscale. Vous n'avez rien à faire : nous nous occupons de tout et nous vous tenons informé.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "شكرا بزاف {prenom} 🙏 توصلنا بالوثائق المصادق عليها والخلاص ديال {montant} درهم ✅\n\nالملف ديالكم غادي مزيان! دابا غادي نسجلو القانون الأساسي وعقد التوطين. ما خاصكم تديرو والو: حنا متكلفين بكلشي.",
        "subj": "شكرا! الملف ديالكم دوز للتسجيل",
        "mail": "السلام عليكم {prenom}،\n\nتوصلنا بالوثائق المصادق عليها وبالخلاص ديال {montant} درهم. شكرا على السرعة ديالكم!\n\nالملف ديالكم غادي مزيان. دابا غادي نسجلو القانون الأساسي وعقد التوطين عند إدارة الضرائب (التسجيل). ما خاصكم تديرو والو: حنا متكلفين بكلشي وغادي نعلموكم.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    enr: {
      "n": "6",
      "title": "Enregistrement terminé",
      "fr": {
        "wa": "Bonjour {prenom}, encore une étape franchie 💪 Les statuts et le contrat de domiciliation sont enregistrés.\n\nNous déposons maintenant le dossier d'immatriculation : taxe professionnelle, identifiant fiscal, registre de commerce, ICE et CNSS. Plus de la moitié du chemin est déjà faite !",
        "subj": "Encore une étape franchie : dépôt de votre dossier",
        "mail": "Bonjour {prenom},\n\nBonne nouvelle : les statuts et le contrat de domiciliation de {societe} sont enregistrés.\n\nNous déposons maintenant le dossier d'immatriculation afin d'obtenir :\n• la taxe professionnelle\n• l'identifiant fiscal (IF)\n• le registre de commerce (RC)\n• l'ICE (Identifiant Commun de l'Entreprise)\n• l'affiliation à la CNSS\n\nPlus de la moitié du chemin est déjà faite. Nous vous tenons informé du résultat.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom}، دوزنا خطوة أخرى 💪 تسجلو القانون الأساسي وعقد التوطين.\n\nدابا كندفعو ملف التقييد: الباتنتا، التعريف الضريبي، السجل التجاري، ICE و CNSS. دوزنا كثر من النص ديال الطريق!",
        "subj": "دوزنا خطوة أخرى: الملف ديالكم تدفع",
        "mail": "السلام عليكم {prenom}،\n\nخبر زوين: تسجلو القانون الأساسي وعقد التوطين ديال {societe}.\n\nدابا كندفعو ملف التقييد باش نجيبو:\n• الضريبة المهنية (الباتنتا)\n• التعريف الضريبي (IF)\n• السجل التجاري (RC)\n• ICE (المعرف الموحد للمقاولة)\n• التسجيل فـ CNSS\n\nدوزنا كثر من النص ديال الطريق. غادي نعلموكم بالنتيجة.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    rejet: {
      "n": "6 bis",
      "title": "Dossier rejeté (problème côté client)",
      "fr": {
        "wa": "Bonjour {prenom}, nous tenions à vous informer que l'administration nous a retourné le dossier {ref} pour la raison suivante :\n« {motif} »\n\nPas d'inquiétude, cela arrive et se règle rapidement 🙂 Il nous suffit de recevoir le document corrigé. Dès réception, nous redéposons votre dossier en priorité.\n\nVotre juriste reste à votre disposition pour vous guider.",
        "subj": "Une petite correction et on continue · dossier {ref}",
        "mail": "Bonjour {prenom},\n\nNous tenions à vous informer que l'administration nous a retourné le dossier de {societe} pour le motif suivant :\n« {motif} »\n\nPas d'inquiétude : cela arrive, et se règle rapidement. Il nous suffit de recevoir le document corrigé (par exemple une copie de CIN en cours de validité, ou le document à nouveau légalisé).\n\nDès réception, nous redéposons votre dossier en priorité. Votre juriste reste à votre disposition par téléphone ou sur WhatsApp pour vous guider pas à pas.\n\nMerci pour votre compréhension.\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "السلام عليكم {prenom}، بغينا نعلموكم بلي الإدارة رجعات لينا الملف {ref} على هاد السبب:\n« {motif} »\n\nما تقلقوش، هادشي كيوقع وكيتحل بالزربة 🙂 غير صيفطو لينا الوثيقة المصححة، وغير نتوصلو بيها كنعاودو ندفعو الملف ديالكم بالأولوية.\n\nالمستشار ديالكم رهن الإشارة باش يعاونكم.",
        "subj": "تصحيح صغير ونكملو · الملف {ref}",
        "mail": "السلام عليكم {prenom}،\n\nبغينا نعلموكم بلي الإدارة رجعات لينا الملف ديال {societe} على هاد السبب:\n« {motif} »\n\nما تقلقوش: هادشي كيوقع وكيتحل بالزربة. غير صيفطو لينا الوثيقة المصححة (مثلا نسخة ديال البطاقة الوطنية صالحة، ولا الوثيقة مصادق عليها من جديد).\n\nغير نتوصلو بيها، كنعاودو ندفعو الملف ديالكم بالأولوية. المستشار ديالكم رهن الإشارة فالتيليفون ولا فالواتساب باش يعاونكم خطوة بخطوة.\n\nشكرا على التفهم ديالكم.\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    rc: {
      "n": "7",
      "title": "Société immatriculée : TP, IF, RC, ICE, CNSS",
      "fr": {
        "wa": "{prenom}, c'est officiel 🏛️ {societe} est immatriculée ! Registre de commerce, ICE, identifiant fiscal, taxe professionnelle et CNSS : tout est obtenu. Toutes nos félicitations !\n\nIl ne reste que les publications (annonce au journal et Bulletin Officiel), et nous nous en chargeons pour vous.",
        "subj": "C'est officiel : {societe} est immatriculée !",
        "mail": "Bonjour {prenom},\n\nToutes nos félicitations : {societe} est officiellement immatriculée. Votre société dispose désormais de son registre de commerce (RC), de son ICE, de son identifiant fiscal (IF), de sa taxe professionnelle et de son affiliation à la CNSS.\n\nIl ne reste que deux formalités de publication, dont nous nous chargeons pour vous :\n• la publication au Bulletin Officiel\n• l'annonce légale dans un journal\n\nSuivi de votre dossier : {suivi}{sig}"
      },
      "ar": {
        "wa": "{prenom}، ولات رسمية 🏛️ {societe} تقيدات! السجل التجاري، ICE، التعريف الضريبي، الباتنتا و CNSS: كلشي واجد. ألف مبروك!\n\nبقاو غير جوج ديال النشرات، وحنا اللي غادي نتكلفو بيهم.",
        "subj": "ولات رسمية: {societe} تقيدات!",
        "mail": "السلام عليكم {prenom}،\n\nألف مبروك: {societe} تقيدات رسميا. الشركة ديالكم دابا عندها السجل التجاري (RC)، ICE، التعريف الضريبي (IF)، الباتنتا والتسجيل فـ CNSS.\n\nبقاو غير جوج ديال النشرات، وحنا اللي غادي نتكلفو بيهم:\n• النشر فالجريدة الرسمية (Bulletin Officiel)\n• الإعلان القانوني فجريدة\n\nتتبع الملف ديالكم: {suivi}{sig}"
      }
    },
    complet: {
      "n": "8",
      "title": "Dossier complet : paiement du solde",
      "fr": {
        "wa": "Félicitations {prenom} 🥳 Votre société *{societe}* est créée ! L'annonce légale et le Bulletin Officiel sont publiés, et l'ensemble de vos documents est prêt.\n\nPour les recevoir, il ne reste plus qu'à régler le solde : *{montant} MAD*.\n{paiement}\n\nDès réception, nous vous envoyons tous vos documents. Merci pour votre confiance tout au long de ce parcours 🙏",
        "subj": "Félicitations, votre société {societe} est créée !",
        "mail": "Bonjour {prenom},\n\nC'est avec une grande joie que nous vous annonçons que la création de {societe} est terminée. L'annonce légale est publiée et tous vos documents sont prêts :\nstatuts enregistrés, certificat négatif, registre de commerce, ICE, identifiant fiscal, taxe professionnelle, CNSS, Bulletin Officiel et annonce légale.\n\nPour les recevoir, il ne reste plus qu'à régler le solde de {montant} MAD :\n{paiement}\nMerci d'indiquer la référence {ref} dans le motif du virement.\n\nDès réception, nous vous envoyons l'ensemble de vos documents.\n\nMerci pour votre confiance tout au long de ce parcours.{sig}"
      },
      "ar": {
        "wa": "مبروك {prenom} 🥳 الشركة ديالكم *{societe}* تأسسات! الإعلان القانوني تنشر وجميع الوثائق ديالكم واجدين.\n\nباش توصلكم، بقا غير تخلصو الباقي: *{montant} درهم*.\n{paiement}\n\nغير نتوصلو بالخلاص، كنصيفطو ليكم جميع الوثائق. شكرا على الثقة ديالكم طول هاد المشوار 🙏",
        "subj": "مبروك، الشركة ديالكم {societe} تأسسات!",
        "mail": "السلام عليكم {prenom}،\n\nبفرحة كبيرة كنخبروكم بلي التأسيس ديال {societe} سالا. الإعلان القانوني تنشر وجميع الوثائق ديالكم واجدين:\nالقانون الأساسي المسجل، الشهادة السلبية، السجل التجاري، ICE، التعريف الضريبي، الباتنتا، CNSS، الجريدة الرسمية والإعلان القانوني.\n\nباش يوصلوكم، بقا غير تخلصو الباقي ديال {montant} درهم:\n{paiement}\nمن فضلكم كتبو المرجع {ref} فسبب التحويل.\n\nغير نتوصلو بالخلاص، كنصيفطو ليكم جميع الوثائق ديالكم.\n\nشكرا على الثقة ديالكم طول هاد المشوار.{sig}"
      }
    },
    livre: {
      "n": "9",
      "title": "Solde reçu : documents envoyés",
      "fr": {
        "wa": "Merci {prenom} ! Paiement bien reçu ✅ Tous les documents de {societe} viennent de vous être envoyés par e-mail.\n\nBienvenue dans le monde des entrepreneurs 🚀 Ce fut un plaisir de vous accompagner.\n\nBesoin d'un logo, de cartes de visite ou d'un pacte d'associés ? Répondez simplement à ce message.\n\n🎁 Un proche veut créer sa société ? Recommandez-nous : nous en prendrons soin comme de vous.",
        "subj": "Bienvenue dans le monde des entrepreneurs !",
        "mail": "Bonjour {prenom},\n\nNous avons bien reçu votre paiement et vous en remercions.\n\nVous trouverez en pièces jointes tous les documents de {societe}. Conservez-les précieusement : ils vous serviront notamment à ouvrir votre compte bancaire professionnel.\n\nCe fut un vrai plaisir de vous accompagner, et toute l'équipe vous souhaite une belle réussite.\n\nPour bien démarrer votre activité, nous pouvons aussi vous proposer un logo, des cartes de visite ou un pacte d'associés : il vous suffit de répondre à cet e-mail.\n\nEt si un proche souhaite créer sa société, recommandez-nous : nous en prendrons soin comme de vous.\n\nNous restons à vos côtés pour la suite.{sig}"
      },
      "ar": {
        "wa": "شكرا {prenom}! توصلنا بالخلاص ✅ صيفطنا ليكم دابا جميع الوثائق ديال {societe} فالإيميل.\n\nمرحبا بيكم فعالم المقاولين 🚀 كان لينا الشرف نكونو معاكم.\n\nمحتاجين لوغو، كارط فيزيت ولا عقد الشركاء؟ غير جاوبونا على هاد الميساج.\n\n🎁 شي حد من معارفكم بغا يأسس شركة؟ نصحو بينا: غادي نتهلاو فيه بحالكم.",
        "subj": "مرحبا بيكم فعالم المقاولين!",
        "mail": "السلام عليكم {prenom}،\n\nتوصلنا بالخلاص ديالكم، وكنشكروكم عليه.\n\nغادي تلقاو مرفقين مع هاد الإيميل جميع الوثائق ديال {societe}. حافظو عليهم مزيان: غادي تحتاجوهم خصوصا باش تحلو الحساب البنكي ديال الشركة.\n\nكان لينا الشرف نكونو معاكم، والفريق كامل كيتمنى ليكم النجاح والتوفيق.\n\nباش تبداو النشاط ديالكم مزيان، نقدرو نوجدو ليكم حتى اللوغو، الكارط فيزيت ولا عقد الشركاء (Pacte d'associés): غير جاوبونا على هاد الإيميل.\n\nوإلا شي حد من معارفكم بغا يأسس شركة، نصحو بينا: غادي نتهلاو فيه بحالكم.\n\nحنا ديما معاكم.{sig}"
      }
    }
  };
  return { PAY_INFO, SUIVI_URL, SIG, BLOCAGE, MSG };
})();
