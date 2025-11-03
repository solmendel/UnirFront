# app/bootstrap.py
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from typing import Dict, List

from app.domain.models import Channel, Message, Conversation
from app.infra.inmemory.in_memory_message_store import InMemoryMessageStore
from app.infra.inmemory.in_memory_conversation_store import InMemoryConversationStore
from app.application.analytics_service import AnalyticsService


def _get_ba_tz():
    """Obtiene la tz de Buenos Aires. Si no está instalada, usa UTC-3 como fallback."""
    try:
        return ZoneInfo("America/Argentina/Buenos_Aires")
    except ZoneInfoNotFoundError:
        return timezone(timedelta(hours=-3))  # ART sin DST


# ===== Singletons simples (demo/MVP) =====
conv_store = InMemoryConversationStore()
msg_store = InMemoryMessageStore()
analytics_service = AnalyticsService(conv_store, msg_store)

# Activa/desactiva la semilla al iniciar la app
SEED_ON_START = True


# ====== DATASET DE SEMILLA (actualizado por semanas) ======
SEED_MESSAGES: List[Dict] = [

    # =========================
    # Semana anterior (20–26 Oct 2025) → 5 mensajes
    # =========================

    # Lun 20-Oct-2025 (2)
    { "channel": "gmail",     "sender": "cliente3@gmail.com", "message": "¿Hay pick-up en local?",      "timestamp": "2025-10-20T15:00:00Z", "outgoing": False },
    { "channel": "gmail",     "sender": "cliente3@gmail.com", "message": "Sí, de 10 a 19 hs",           "timestamp": "2025-10-20T15:04:00Z", "outgoing": True  },

    # Mié 22-Oct-2025 (1)
    { "channel": "instagram", "sender": "ig_user_03", "message": "¿Medios de pago?",                    "timestamp": "2025-10-22T18:30:00Z", "outgoing": False },

    # Jue 23-Oct-2025 (1)
    { "channel": "whatsapp",  "sender": "+54911-BBB", "message": "¿Horario de atención?",               "timestamp": "2025-10-23T13:00:00Z", "outgoing": False },

    # Sáb 25-Oct-2025 (1)
    { "channel": "whatsapp",  "sender": "+54911-BBB", "message": "De 10 a 19 hs.",                      "timestamp": "2025-10-25T11:06:00Z", "outgoing": True  },

    # =========================
    # Semana actual (27 Oct – 02 Nov 2025) → 15 mensajes
    # Distribución: Lun 2, Mar 2, Mié 2, Jue 2, Vie 2, Sáb 2, Dom 3
    # =========================

    # Lun 27-Oct-2025 (2)
    { "channel": "whatsapp",  "sender": "+54911-AAA", "message": "Vuelvo por el tema del talle",        "timestamp": "2025-10-27T14:00:00Z", "outgoing": False },
    { "channel": "whatsapp",  "sender": "+54911-AAA", "message": "Te guardo M y L",                     "timestamp": "2025-10-27T14:06:00Z", "outgoing": True  },

    # Mar 28-Oct-2025 (2)
    { "channel": "gmail",     "sender": "cliente1@gmail.com", "message": "Quiero info de envíos",       "timestamp": "2025-10-28T15:00:00Z", "outgoing": False },
    { "channel": "gmail",     "sender": "cliente1@gmail.com", "message": "Hacemos a todo el país por OCA", "timestamp": "2025-10-28T15:05:00Z", "outgoing": True  },

    # Mié 29-Oct-2025 (2)
    { "channel": "instagram", "sender": "ig_user_01", "message": "Precio del combo?",                   "timestamp": "2025-10-29T14:10:00Z", "outgoing": False },
    { "channel": "instagram", "sender": "ig_user_01", "message": "Sale $25.000. ¿Te sirve?",            "timestamp": "2025-10-29T14:14:00Z", "outgoing": True  },

    # Jue 30-Oct-2025 (2)
    { "channel": "whatsapp",  "sender": "+54911...",  "message": "Hola",                                "timestamp": "2025-10-30T12:00:00Z", "outgoing": False },
    { "channel": "whatsapp",  "sender": "+54911...",  "message": "¡Hola! ¿En qué puedo ayudarte?",      "timestamp": "2025-10-30T12:03:00Z", "outgoing": True  },

    # Vie 31-Oct-2025 (2)
    { "channel": "whatsapp",  "sender": "+54911-CCC", "message": "Consulta por envío a CABA",           "timestamp": "2025-10-31T13:00:00Z", "outgoing": False },
    { "channel": "whatsapp",  "sender": "+54911-CCC", "message": "En CABA llega en 24/48 hs.",          "timestamp": "2025-10-31T13:06:00Z", "outgoing": True  },

    # Sáb 01-Nov-2025 (2)
    { "channel": "gmail",     "sender": "cliente4@gmail.com", "message": "¿Cuánto tarda a Rosario?",    "timestamp": "2025-11-01T12:20:00Z", "outgoing": False },
    { "channel": "gmail",     "sender": "cliente4@gmail.com", "message": "Entre 3 y 5 días hábiles",    "timestamp": "2025-11-01T12:26:00Z", "outgoing": True  },

    # Dom 02-Nov-2025 (3)
    { "channel": "instagram", "sender": "ig_user_04", "message": "¿Tienen talla S negra?",              "timestamp": "2025-11-02T14:00:00Z", "outgoing": False },
    { "channel": "whatsapp",  "sender": "+54911-AAA", "message": "¿Puedo pasar hoy a retirar?",         "timestamp": "2025-11-02T16:00:00Z", "outgoing": False },
    { "channel": "whatsapp",  "sender": "+54911-AAA", "message": "Sí, hoy de 16 a 19",                  "timestamp": "2025-11-02T16:05:00Z", "outgoing": True  },
]


def seed() -> None:
    """
    Carga la semilla aplicando la regla:
    - Si un sender envía un mensaje en un DIA LOCAL (BA) distinto al de su último mensaje,
      se abre una NUEVA conversación.
    - Se guarda todo en UTC, pero los cortes por día se evalúan en BA.
    """
    ba_tz = _get_ba_tz()
    utc = ZoneInfo("UTC")

    # Estado por sender para cortar conversación cuando cambia el día local
    last_local_date_by_sender: Dict[str, datetime.date] = {}
    current_conv_by_sender: Dict[str, str] = {}

    # Ordenar por timestamp ASC por las dudas
    ordered = sorted(SEED_MESSAGES, key=lambda x: x["timestamp"])

    for ev in ordered:
        # Parseo del timestamp (viene con 'Z' → UTC)
        ts_utc = datetime.fromisoformat(ev["timestamp"].replace("Z", "+00:00")).astimezone(utc)
        ts_local = ts_utc.astimezone(ba_tz)
        local_date = ts_local.date()

        sender = ev["sender"]
        channel = Channel(ev["channel"])  # "whatsapp"/"instagram"/"gmail"
        outgoing = bool(ev.get("outgoing", False))
        text = ev.get("message", "")
        agent_id = ev.get("agent_id")

        # ¿Hay que abrir nueva conversación por cambio de día local (regla B)?
        need_new_conv = (
            sender not in current_conv_by_sender or
            last_local_date_by_sender.get(sender) != local_date
        )

        if need_new_conv:
            conv_id = f"conv:{sender}:{int(ts_utc.timestamp())}"
            conv = Conversation(
                id=conv_id,
                customer_id=sender,
                opened_at=ts_utc,          # guardamos UTC
                channel=channel
            )
            conv_store.open(conv)
            current_conv_by_sender[sender] = conv_id
            last_local_date_by_sender[sender] = local_date

            # Si el evento actual es IN, es el primer recibido de la nueva conversación
            if not outgoing:
                conv_store.upsert_first_received(conv_id, ts_utc)

        # Si es OUT y aún no seteamos first_response → setearla
        conv_id_for_sender = current_conv_by_sender[sender]
        if outgoing:
            conv_store.upsert_first_response(conv_id_for_sender, ts_utc)
        else:
            # Si es IN y la conv no tiene first_received seteado aún (por si se abrió por OUT previo)
            conv_store.upsert_first_received(conv_id_for_sender, ts_utc)

        # Guardar el mensaje (siempre en UTC)
        msg_store.add(Message(
            channel=channel,
            sender=sender,
            text=text,
            timestamp=ts_utc,
            outgoing=outgoing,
            agent_id=agent_id
        ))


# Ejecutar semilla al importar, si está activada
if SEED_ON_START:
    seed()
