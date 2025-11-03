
from __future__ import annotations
from typing import Dict, List, Optional
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from collections import OrderedDict

from app.domain.models import Channel, Conversation, Message
from app.ports.conversation_store import ConversationStore, MessageStore

class AnalyticsService:
    def __init__(self, conv_store: ConversationStore, msg_store: MessageStore):
        self.conv_store = conv_store
        self.msg_store = msg_store

    def dashboard(self) -> Dict[str, object]:
        zone = ZoneInfo("America/Argentina/Buenos_Aires")
        today = datetime.now(zone).date()

        # Monday to Sunday
        this_week_start = today - timedelta(days=today.weekday())  # Monday
        this_week_end = this_week_start + timedelta(days=6)        # Sunday
        last_week_start = this_week_start - timedelta(weeks=1)
        last_week_end = this_week_start - timedelta(days=1)

        r: Dict[str, object] = OrderedDict()
        r["general"] = self._build_general_metrics(zone)
        
        semana_anterior = self._build_weekly_metrics(last_week_start, last_week_end, zone)
        semana_actual = self._build_weekly_metrics(this_week_start, this_week_end, zone)
        
        r["semana_anterior"] = semana_anterior
        r["semana_actual"] = semana_actual
        r["comparativa_semanal"] = self._build_weekly_comparison(semana_anterior, semana_actual)
        
        return r

    # ============================== GENERAL (histórico completo) ==============================
    def _build_general_metrics(self, zone: ZoneInfo) -> Dict[str, object]:
        convs = self.conv_store.all()

        frts_min: List[int] = [
            c.frt_minutes() for c in convs
            if c.first_received_at is not None and c.first_response_at is not None and c.frt_minutes() is not None
        ]
        frt_avg: Optional[float] = None if not frts_min else (sum(frts_min) / len(frts_min))

        total_conv = len(convs)
        ok24 = sum(
            1 for c in convs
            if c.first_received_at and c.first_response_at and c.frt_minutes() is not None and c.frt_minutes() <= 1440
        )
        pct24h = None if total_conv == 0 else (100.0 * ok24 / total_conv)

        all_msgs = self.msg_store.all()
        total_in = sum(1 for m in all_msgs if not m.outgoing)
        total_out = sum(1 for m in all_msgs if m.outgoing)

        por_canal = OrderedDict()
        for ch in Channel:
            ins = sum(1 for m in all_msgs if m.channel == ch and not m.outgoing)
            outs = sum(1 for m in all_msgs if m.channel == ch and m.outgoing)
            por_canal[ch.value] = {"in": ins, "out": outs}

        g: Dict[str, object] = OrderedDict()
        g["frt_avg_min"] = frt_avg
        g["pct_respondido_24h"] = pct24h
        g["conversations_total"] = total_conv
        g["mensajes_totales_in"] = total_in
        g["mensajes_totales_out"] = total_out
        g["por_canal_total"] = por_canal
        return g

    # ============================== SEMANAL (lunes–domingo) ==============================
    def _build_weekly_metrics(self, week_start: date, week_end: date, zone: ZoneInfo) -> Dict[str, object]:
        # Ventana [from, to)
        from_dt = datetime.combine(week_start, time.min, tzinfo=zone).astimezone(ZoneInfo("UTC"))
        to_dt = datetime.combine(week_end + timedelta(days=1), time.min, tzinfo=zone).astimezone(ZoneInfo("UTC"))

        all_msgs = self.msg_store.all()
        msgsW = [m for m in all_msgs if (m.timestamp >= from_dt and m.timestamp < to_dt)]

        # Conversaciones por semana = senders distintos con actividad en la semana
        conversations = len({m.sender for m in msgsW})

        total_in = sum(1 for m in msgsW if not m.outgoing)
        total_out = sum(1 for m in msgsW if m.outgoing)

        por_canal = OrderedDict()
        for ch in Channel:
            ins = sum(1 for m in msgsW if m.channel == ch and not m.outgoing)
            outs = sum(1 for m in msgsW if m.channel == ch and m.outgoing)
            por_canal[ch.value] = {"in": ins, "out": outs}

        # Mensajes por día (IN/OUT)
        por_dia = OrderedDict()
        d = week_start
        while d <= week_end:
            por_dia[str(d)] = {"in": 0, "out": 0}
            d += timedelta(days=1)
        for m in msgsW:
            local_dt = m.timestamp.astimezone(zone)
            ld = str(local_dt.date())
            if ld in por_dia:
                if m.outgoing:
                    por_dia[ld]["out"] += 1
                else:
                    por_dia[ld]["in"] += 1

        # Mensajes por día y por canal (IN/OUT)
        por_dia_por_canal = OrderedDict()
        d = week_start
        while d <= week_end:
            por_dia_por_canal[str(d)] = OrderedDict()
            for ch in Channel:
                por_dia_por_canal[str(d)][ch.value] = {"in": 0, "out": 0}
            d += timedelta(days=1)
        for m in msgsW:
            local_dt = m.timestamp.astimezone(zone)
            ld = str(local_dt.date())
            if ld in por_dia_por_canal:
                canal_str = m.channel.value
                if canal_str in por_dia_por_canal[ld]:
                    if m.outgoing:
                        por_dia_por_canal[ld][canal_str]["out"] += 1
                    else:
                        por_dia_por_canal[ld][canal_str]["in"] += 1

        # FRT semanal: se atribuye a la semana del OUT
        convs = self.conv_store.all()
        frts_min = [
            c.frt_minutes() for c in convs
            if c.first_received_at is not None and c.first_response_at is not None
            and c.first_response_at >= from_dt and c.first_response_at < to_dt
            and c.frt_minutes() is not None
        ]
        frt_avg = None if not frts_min else (sum(frts_min) / len(frts_min))

        # SLA duro semanal: denominador = conv con primer IN en la semana
        conv_in_week = [
            c for c in convs
            if c.first_received_at is not None and c.first_received_at >= from_dt and c.first_received_at < to_dt
        ]
        total_conv_week = len(conv_in_week)
        ok24week = sum(
            1 for c in conv_in_week
            if c.first_response_at is not None and c.frt_minutes() is not None and c.frt_minutes() <= 1440
        )
        pct24h = None if total_conv_week == 0 else (100.0 * ok24week / total_conv_week)

        out: Dict[str, object] = OrderedDict()
        out["ventana"] = {
            "desde_lunes": str(week_start),
            "hasta_domingo": str(week_end),
            "zona": str(zone.key),
        }
        out["frt_avg_min"] = frt_avg
        out["pct_respondido_24h"] = pct24h
        out["conversations"] = conversations
        out["mensajes_totales_in"] = total_in
        out["mensajes_totales_out"] = total_out
        out["por_canal"] = por_canal
        out["mensajes_por_dia"] = por_dia
        out["mensajes_por_dia_por_canal"] = por_dia_por_canal
        return out

    # ============================== COMPARATIVA SEMANAL ==============================
    def _build_weekly_comparison(self, semana_anterior: Dict[str, object], semana_actual: Dict[str, object]) -> Dict[str, object]:
        """
        Calcula los porcentajes de cambio entre la semana anterior y la actual.
        Un valor positivo indica crecimiento, un valor negativo indica decrecimiento.
        """
        def calcular_cambio_porcentual(valor_anterior, valor_actual) -> Optional[float]:
            """Calcula el % de cambio: ((actual - anterior) / anterior) * 100"""
            if valor_anterior is None or valor_actual is None:
                return None
            if valor_anterior == 0:
                # Si el valor anterior es 0 y el actual no, consideramos crecimiento infinito
                # Lo representamos como None o un valor especial
                if valor_actual == 0:
                    return 0.0
                return None  # No se puede calcular % cuando se divide por 0
            return ((valor_actual - valor_anterior) / valor_anterior) * 100.0

        comparativa: Dict[str, object] = OrderedDict()
        
        # Mensajes totales (entrantes)
        msg_in_anterior = semana_anterior.get("mensajes_totales_in", 0)
        msg_in_actual = semana_actual.get("mensajes_totales_in", 0)
        comparativa["mensajes_totales_in"] = {
            "semana_anterior": msg_in_anterior,
            "semana_actual": msg_in_actual,
            "cambio_porcentual": calcular_cambio_porcentual(msg_in_anterior, msg_in_actual)
        }
        
        # Mensajes respondidos (salientes)
        msg_out_anterior = semana_anterior.get("mensajes_totales_out", 0)
        msg_out_actual = semana_actual.get("mensajes_totales_out", 0)
        comparativa["mensajes_respondidos"] = {
            "semana_anterior": msg_out_anterior,
            "semana_actual": msg_out_actual,
            "cambio_porcentual": calcular_cambio_porcentual(msg_out_anterior, msg_out_actual)
        }
        
        # Tiempo promedio de respuesta (FRT en minutos)
        frt_anterior = semana_anterior.get("frt_avg_min")
        frt_actual = semana_actual.get("frt_avg_min")
        comparativa["tiempo_promedio_respuesta_min"] = {
            "semana_anterior": frt_anterior,
            "semana_actual": frt_actual,
            "cambio_porcentual": calcular_cambio_porcentual(frt_anterior, frt_actual)
        }
        
        # Tasa de respuesta (% respondido en 24h)
        # Para la tasa de respuesta, calculamos la diferencia en puntos porcentuales
        # en lugar del cambio porcentual relativo
        tasa_anterior = semana_anterior.get("pct_respondido_24h")
        tasa_actual = semana_actual.get("pct_respondido_24h")
        diferencia_puntos = None
        if tasa_anterior is not None and tasa_actual is not None:
            diferencia_puntos = tasa_actual - tasa_anterior
        comparativa["tasa_respuesta_24h"] = {
            "semana_anterior": tasa_anterior,
            "semana_actual": tasa_actual,
            "cambio_porcentual": diferencia_puntos  # Diferencia en puntos porcentuales
        }
        
        # Conversaciones totales
        conv_anterior = semana_anterior.get("conversations", 0)
        conv_actual = semana_actual.get("conversations", 0)
        comparativa["conversaciones"] = {
            "semana_anterior": conv_anterior,
            "semana_actual": conv_actual,
            "cambio_porcentual": calcular_cambio_porcentual(conv_anterior, conv_actual)
        }
        
        return comparativa
