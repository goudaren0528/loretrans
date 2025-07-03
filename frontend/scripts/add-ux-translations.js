#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要添加的UX翻译键（其他语言版本）
const UX_TRANSLATIONS = {
  es: {
    "translation": {
      "start_translation": "Comenzar traducción",
      "translation_complete": "Traducción completa",
      "translation_failed": "Traducción fallida",
      "translating": "Traduciendo...",
      "preparing_engine": "Preparando motor de traducción...",
      "about_to_start": "A punto de comenzar la traducción...",
      "processing": "Traducción en progreso, por favor espere...",
      "engine_running": "Motor de traducción funcionando a plena capacidad...",
      "optimizing_quality": "Optimizando calidad de traducción...",
      "translation_paused": "Traducción pausada",
      "resume_translation": "Haga clic en continuar para reanudar la traducción",
      "translation_error": "Se encontró un problema durante la traducción",
      "service_unavailable": "Servicio de traducción temporalmente no disponible, inténtelo más tarde",
      "input_placeholder": "Ingrese el texto a traducir...",
      "result_placeholder": "Los resultados de traducción se mostrarán aquí...",
      "from_language": "traducir de",
      "to_language": "traducir a",
      "partial_complete": "Traducción parcialmente completa",
      "partial_description": "Se encontraron algunos problemas durante la traducción, pero hemos guardado los resultados parciales para usted"
    },
    "task": {
      "task_management": "Gestión de tareas de traducción",
      "manage_description": "Gestione sus tareas de traducción, vea el progreso y los resultados",
      "new_translation": "Nueva traducción",
      "refresh_tasks": "Actualizar",
      "task_list_updated": "Lista de tareas actualizada",
      "refresh_failed": "Error al actualizar",
      "operation_success": "Operación exitosa",
      "operation_failed": "Operación fallida",
      "select_tasks_first": "Por favor seleccione las tareas primero",
      "no_tasks": "Sin tareas",
      "no_matching_tasks": "No hay tareas que coincidan",
      "create_first_task": "¡Aún no hay tareas de traducción, cree una!",
      "search_placeholder": "Buscar tareas...",
      "queue_created": "Tarea de traducción creada",
      "can_leave_page": "Puede salir de esta página, vea los resultados más tarde en \"Mis tareas\"",
      "check_in_tasks": "Puede verificar el progreso en la gestión de tareas",
      "view_in_tasks": "Por favor vaya a la página \"Mis tareas\" para ver el progreso de traducción"
    },
    "progress": {
      "preparing": "Preparando",
      "processing": "Procesando",
      "finalizing": "Finalizando",
      "completed": "Completado",
      "paused": "Pausado",
      "failed": "Fallido",
      "cancelled": "Cancelado",
      "partial_success": "Éxito parcial",
      "progress": "Progreso",
      "understanding_text": "Entendiendo su texto...",
      "analyzing_language": "Analizando características del idioma...",
      "processing_content": "Procesando su contenido...",
      "checking_grammar": "Verificando gramática y fluidez...",
      "final_polish": "Pulido final...",
      "presenting_results": "A punto de presentar los resultados...",
      "results_ready": "Resultados listos",
      "thank_you_waiting": "Gracias por su paciencia",
      "progress_saved": "Su progreso ha sido guardado",
      "processing_time_long": "Tiempo de procesamiento largo",
      "instant_processing": "Procesamiento instantáneo",
      "background_processing": "Procesamiento en segundo plano",
      "smart_processing": "Procesamiento inteligente"
    },
    "time": {
      "time_estimate": "Estimación de tiempo",
      "estimated_time": "Tiempo restante estimado",
      "can_leave": "Puede salir de la página",
      "accurate_estimate": "Estimación precisa",
      "rough_estimate": "Estimación aproximada",
      "approximate_estimate": "Estimación aproximada",
      "fast_queue": "Cola rápida",
      "creation_time": "Tiempo de creación"
    },
    "error": {
      "error_recovery": "Recuperación de errores",
      "retry_failed": "Reintento fallido",
      "unknown_error": "Error desconocido",
      "partial_results": "Resultados parciales",
      "retry_failed_parts": "Reintentar partes fallidas",
      "download_partial": "Descargar resultados parciales",
      "segment_retry": "Reintento segmentado",
      "encountered_problem": "Problema encontrado",
      "trying_to_resolve": "Estamos tratando de resolver",
      "contact_support": "Por favor espere o contacte soporte",
      "please_retry_later": "Por favor inténtelo más tarde"
    },
    "success": {
      "completed": "Completado",
      "operation_success": "Operación exitosa",
      "partial_success": "Éxito parcial",
      "almost_done": "¡Casi terminado!",
      "results_shown_below": "Resultados mostrados abajo",
      "half_completed": "¡Más de la mitad completado, siga adelante!"
    },
    "credits": {
      "estimated_consumption": "Consumo estimado",
      "credits_consumed": "Créditos consumidos",
      "credits_processing": "Explicación del procesamiento de créditos",
      "consumed_credits": "Créditos consumidos",
      "refunded_credits": "Créditos reembolsados",
      "retry_only_failed": "Solo pague créditos por partes fallidas al reintentar"
    },
    "language": {
      "source_language": "Idioma origen",
      "target_language": "Idioma destino",
      "select_source": "Seleccionar idioma origen",
      "select_target": "Seleccionar idioma destino"
    },
    "ui": {
      "start": "Comenzar",
      "pause": "Pausar",
      "resume": "Reanudar",
      "continue": "Continuar",
      "cancel": "Cancelar",
      "retry": "Reintentar",
      "download": "Descargar",
      "delete": "Eliminar",
      "refresh": "Actualizar",
      "all": "Todo",
      "status": "Estado",
      "priority": "Prioridad",
      "sort": "Ordenar",
      "normal": "Normal",
      "high": "Alto",
      "urgent": "Urgente",
      "low": "Bajo",
      "waiting": "Esperando",
      "active": "Activo",
      "needs_attention": "Necesita atención",
      "submitting": "Enviando...",
      "downloading": "Descarga iniciada",
      "retrying": "Reintento iniciado",
      "copied": "Copiado",
      "text_copied": "Texto copiado al portapapeles",
      "input_text": "Texto de entrada",
      "translation_result": "Resultado de traducción",
      "characters": "caracteres",
      "total_tasks": "Total de tareas",
      "select_all": "Seleccionar todo",
      "batch_operations": "Operaciones por lotes",
      "set_priority": "Establecer prioridad"
    }
  },
  
  fr: {
    "translation": {
      "start_translation": "Commencer la traduction",
      "translation_complete": "Traduction terminée",
      "translation_failed": "Traduction échouée",
      "translating": "Traduction en cours...",
      "preparing_engine": "Préparation du moteur de traduction...",
      "about_to_start": "Sur le point de commencer la traduction...",
      "processing": "Traduction en cours, veuillez patienter...",
      "engine_running": "Moteur de traduction fonctionnant à pleine capacité...",
      "optimizing_quality": "Optimisation de la qualité de traduction...",
      "translation_paused": "Traduction en pause",
      "resume_translation": "Cliquez sur continuer pour reprendre la traduction",
      "translation_error": "Un problème a été rencontré pendant la traduction",
      "service_unavailable": "Service de traduction temporairement indisponible, veuillez réessayer plus tard",
      "input_placeholder": "Saisissez le texte à traduire...",
      "result_placeholder": "Les résultats de traduction s'afficheront ici...",
      "from_language": "traduire de",
      "to_language": "traduire vers",
      "partial_complete": "Traduction partiellement terminée",
      "partial_description": "Quelques problèmes ont été rencontrés pendant la traduction, mais nous avons sauvegardé les résultats partiels pour vous"
    },
    "task": {
      "task_management": "Gestion des tâches de traduction",
      "manage_description": "Gérez vos tâches de traduction, consultez les progrès et les résultats",
      "new_translation": "Nouvelle traduction",
      "refresh_tasks": "Actualiser",
      "task_list_updated": "Liste des tâches mise à jour",
      "refresh_failed": "Échec de l'actualisation",
      "operation_success": "Opération réussie",
      "operation_failed": "Opération échouée",
      "select_tasks_first": "Veuillez d'abord sélectionner les tâches",
      "no_tasks": "Aucune tâche",
      "no_matching_tasks": "Aucune tâche correspondante",
      "create_first_task": "Pas encore de tâches de traduction, créez-en une !",
      "search_placeholder": "Rechercher des tâches...",
      "queue_created": "Tâche de traduction créée",
      "can_leave_page": "Vous pouvez quitter cette page, consultez les résultats plus tard dans \"Mes tâches\"",
      "check_in_tasks": "Vous pouvez vérifier les progrès dans la gestion des tâches",
      "view_in_tasks": "Veuillez aller à la page \"Mes tâches\" pour voir les progrès de traduction"
    },
    "progress": {
      "preparing": "Préparation",
      "processing": "Traitement",
      "finalizing": "Finalisation",
      "completed": "Terminé",
      "paused": "En pause",
      "failed": "Échoué",
      "cancelled": "Annulé",
      "partial_success": "Succès partiel",
      "progress": "Progrès",
      "understanding_text": "Compréhension de votre texte...",
      "analyzing_language": "Analyse des caractéristiques linguistiques...",
      "processing_content": "Traitement de votre contenu...",
      "checking_grammar": "Vérification de la grammaire et de la fluidité...",
      "final_polish": "Polissage final...",
      "presenting_results": "Sur le point de présenter les résultats...",
      "results_ready": "Résultats prêts",
      "thank_you_waiting": "Merci pour votre patience",
      "progress_saved": "Vos progrès ont été sauvegardés",
      "processing_time_long": "Temps de traitement long",
      "instant_processing": "Traitement instantané",
      "background_processing": "Traitement en arrière-plan",
      "smart_processing": "Traitement intelligent"
    },
    "time": {
      "time_estimate": "Estimation du temps",
      "estimated_time": "Temps restant estimé",
      "can_leave": "Peut quitter la page",
      "accurate_estimate": "Estimation précise",
      "rough_estimate": "Estimation approximative",
      "approximate_estimate": "Estimation approximative",
      "fast_queue": "File rapide",
      "creation_time": "Temps de création"
    },
    "error": {
      "error_recovery": "Récupération d'erreur",
      "retry_failed": "Nouvelle tentative échouée",
      "unknown_error": "Erreur inconnue",
      "partial_results": "Résultats partiels",
      "retry_failed_parts": "Réessayer les parties échouées",
      "download_partial": "Télécharger les résultats partiels",
      "segment_retry": "Nouvelle tentative segmentée",
      "encountered_problem": "Problème rencontré",
      "trying_to_resolve": "Nous essayons de résoudre",
      "contact_support": "Veuillez patienter ou contacter le support",
      "please_retry_later": "Veuillez réessayer plus tard"
    },
    "success": {
      "completed": "Terminé",
      "operation_success": "Opération réussie",
      "partial_success": "Succès partiel",
      "almost_done": "Presque terminé !",
      "results_shown_below": "Résultats affichés ci-dessous",
      "half_completed": "Plus de la moitié terminé, continuez !"
    },
    "credits": {
      "estimated_consumption": "Consommation estimée",
      "credits_consumed": "Crédits consommés",
      "credits_processing": "Explication du traitement des crédits",
      "consumed_credits": "Crédits consommés",
      "refunded_credits": "Crédits remboursés",
      "retry_only_failed": "Ne payez que les crédits pour les parties échouées lors de la nouvelle tentative"
    },
    "language": {
      "source_language": "Langue source",
      "target_language": "Langue cible",
      "select_source": "Sélectionner la langue source",
      "select_target": "Sélectionner la langue cible"
    },
    "ui": {
      "start": "Commencer",
      "pause": "Pause",
      "resume": "Reprendre",
      "continue": "Continuer",
      "cancel": "Annuler",
      "retry": "Réessayer",
      "download": "Télécharger",
      "delete": "Supprimer",
      "refresh": "Actualiser",
      "all": "Tout",
      "status": "Statut",
      "priority": "Priorité",
      "sort": "Trier",
      "normal": "Normal",
      "high": "Élevé",
      "urgent": "Urgent",
      "low": "Faible",
      "waiting": "En attente",
      "active": "Actif",
      "needs_attention": "Nécessite attention",
      "submitting": "Soumission...",
      "downloading": "Téléchargement commencé",
      "retrying": "Nouvelle tentative commencée",
      "copied": "Copié",
      "text_copied": "Texte copié dans le presse-papiers",
      "input_text": "Texte d'entrée",
      "translation_result": "Résultat de traduction",
      "characters": "caractères",
      "total_tasks": "Total des tâches",
      "select_all": "Tout sélectionner",
      "batch_operations": "Opérations par lots",
      "set_priority": "Définir la priorité"
    }
  },
  
  pt: {
    "translation": {
      "start_translation": "Iniciar tradução",
      "translation_complete": "Tradução completa",
      "translation_failed": "Tradução falhou",
      "translating": "Traduzindo...",
      "preparing_engine": "Preparando motor de tradução...",
      "about_to_start": "Prestes a iniciar a tradução...",
      "processing": "Tradução em andamento, por favor aguarde...",
      "engine_running": "Motor de tradução funcionando a plena capacidade...",
      "optimizing_quality": "Otimizando qualidade da tradução...",
      "translation_paused": "Tradução pausada",
      "resume_translation": "Clique em continuar para retomar a tradução",
      "translation_error": "Um problema foi encontrado durante a tradução",
      "service_unavailable": "Serviço de tradução temporariamente indisponível, tente novamente mais tarde",
      "input_placeholder": "Digite o texto para traduzir...",
      "result_placeholder": "Os resultados da tradução aparecerão aqui...",
      "from_language": "traduzir de",
      "to_language": "traduzir para",
      "partial_complete": "Tradução parcialmente completa",
      "partial_description": "Alguns problemas foram encontrados durante a tradução, mas salvamos os resultados parciais para você"
    },
    "task": {
      "task_management": "Gerenciamento de tarefas de tradução",
      "manage_description": "Gerencie suas tarefas de tradução, veja o progresso e os resultados",
      "new_translation": "Nova tradução",
      "refresh_tasks": "Atualizar",
      "task_list_updated": "Lista de tarefas atualizada",
      "refresh_failed": "Falha ao atualizar",
      "operation_success": "Operação bem-sucedida",
      "operation_failed": "Operação falhou",
      "select_tasks_first": "Por favor selecione as tarefas primeiro",
      "no_tasks": "Sem tarefas",
      "no_matching_tasks": "Nenhuma tarefa correspondente",
      "create_first_task": "Ainda não há tarefas de tradução, crie uma!",
      "search_placeholder": "Pesquisar tarefas...",
      "queue_created": "Tarefa de tradução criada",
      "can_leave_page": "Você pode sair desta página, veja os resultados mais tarde em \"Minhas tarefas\"",
      "check_in_tasks": "Você pode verificar o progresso no gerenciamento de tarefas",
      "view_in_tasks": "Por favor vá para a página \"Minhas tarefas\" para ver o progresso da tradução"
    },
    "progress": {
      "preparing": "Preparando",
      "processing": "Processando",
      "finalizing": "Finalizando",
      "completed": "Concluído",
      "paused": "Pausado",
      "failed": "Falhou",
      "cancelled": "Cancelado",
      "partial_success": "Sucesso parcial",
      "progress": "Progresso",
      "understanding_text": "Entendendo seu texto...",
      "analyzing_language": "Analisando características da linguagem...",
      "processing_content": "Processando seu conteúdo...",
      "checking_grammar": "Verificando gramática e fluência...",
      "final_polish": "Polimento final...",
      "presenting_results": "Prestes a apresentar os resultados...",
      "results_ready": "Resultados prontos",
      "thank_you_waiting": "Obrigado pela sua paciência",
      "progress_saved": "Seu progresso foi salvo",
      "processing_time_long": "Tempo de processamento longo",
      "instant_processing": "Processamento instantâneo",
      "background_processing": "Processamento em segundo plano",
      "smart_processing": "Processamento inteligente"
    },
    "time": {
      "time_estimate": "Estimativa de tempo",
      "estimated_time": "Tempo restante estimado",
      "can_leave": "Pode sair da página",
      "accurate_estimate": "Estimativa precisa",
      "rough_estimate": "Estimativa aproximada",
      "approximate_estimate": "Estimativa aproximada",
      "fast_queue": "Fila rápida",
      "creation_time": "Tempo de criação"
    },
    "error": {
      "error_recovery": "Recuperação de erro",
      "retry_failed": "Nova tentativa falhou",
      "unknown_error": "Erro desconhecido",
      "partial_results": "Resultados parciais",
      "retry_failed_parts": "Tentar novamente partes que falharam",
      "download_partial": "Baixar resultados parciais",
      "segment_retry": "Nova tentativa segmentada",
      "encountered_problem": "Problema encontrado",
      "trying_to_resolve": "Estamos tentando resolver",
      "contact_support": "Por favor aguarde ou entre em contato com o suporte",
      "please_retry_later": "Por favor tente novamente mais tarde"
    },
    "success": {
      "completed": "Concluído",
      "operation_success": "Operação bem-sucedida",
      "partial_success": "Sucesso parcial",
      "almost_done": "Quase terminado!",
      "results_shown_below": "Resultados mostrados abaixo",
      "half_completed": "Mais da metade concluído, continue!"
    },
    "credits": {
      "estimated_consumption": "Consumo estimado",
      "credits_consumed": "Créditos consumidos",
      "credits_processing": "Explicação do processamento de créditos",
      "consumed_credits": "Créditos consumidos",
      "refunded_credits": "Créditos reembolsados",
      "retry_only_failed": "Pague apenas créditos pelas partes que falharam ao tentar novamente"
    },
    "language": {
      "source_language": "Idioma origem",
      "target_language": "Idioma destino",
      "select_source": "Selecionar idioma origem",
      "select_target": "Selecionar idioma destino"
    },
    "ui": {
      "start": "Iniciar",
      "pause": "Pausar",
      "resume": "Retomar",
      "continue": "Continuar",
      "cancel": "Cancelar",
      "retry": "Tentar novamente",
      "download": "Baixar",
      "delete": "Excluir",
      "refresh": "Atualizar",
      "all": "Todos",
      "status": "Status",
      "priority": "Prioridade",
      "sort": "Ordenar",
      "normal": "Normal",
      "high": "Alto",
      "urgent": "Urgente",
      "low": "Baixo",
      "waiting": "Aguardando",
      "active": "Ativo",
      "needs_attention": "Precisa de atenção",
      "submitting": "Enviando...",
      "downloading": "Download iniciado",
      "retrying": "Nova tentativa iniciada",
      "copied": "Copiado",
      "text_copied": "Texto copiado para a área de transferência",
      "input_text": "Texto de entrada",
      "translation_result": "Resultado da tradução",
      "characters": "caracteres",
      "total_tasks": "Total de tarefas",
      "select_all": "Selecionar todos",
      "batch_operations": "Operações em lote",
      "set_priority": "Definir prioridade"
    }
  }
};

// 添加翻译到指定语言文件
function addTranslationsToLanguage(langCode, translations) {
  const langPath = path.join(__dirname, '..', 'messages', `${langCode}.json`);
  
  if (!fs.existsSync(langPath)) {
    console.log(`⚠️  语言文件不存在: ${langCode}.json`);
    return;
  }
  
  const existingTranslations = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  
  // 合并翻译
  Object.keys(translations).forEach(category => {
    if (!existingTranslations[category]) {
      existingTranslations[category] = {};
    }
    
    Object.keys(translations[category]).forEach(key => {
      existingTranslations[category][key] = translations[category][key];
    });
  });
  
  // 保存文件
  fs.writeFileSync(langPath, JSON.stringify(existingTranslations, null, 2), 'utf8');
  
  const addedKeys = Object.keys(translations).reduce((total, category) => {
    return total + Object.keys(translations[category]).length;
  }, 0);
  
  console.log(`✅ ${langCode}: 已添加 ${addedKeys} 个翻译键`);
}

// 主函数
function main() {
  console.log('🌐 为缺失的语言添加UX翻译键...\n');
  
  // 为每种语言添加翻译
  Object.keys(UX_TRANSLATIONS).forEach(langCode => {
    addTranslationsToLanguage(langCode, UX_TRANSLATIONS[langCode]);
  });
  
  console.log('\n🎉 UX翻译键添加完成！');
  console.log('\n📋 下一步:');
  console.log('1. 运行多语言检查脚本验证完整性');
  console.log('2. 在UX组件中替换硬编码文本');
  console.log('3. 测试多语言功能');
}

main();
