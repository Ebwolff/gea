import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { CropField } from '../context/AppContext';

const CULTURE_COLORS: Record<string, string> = {
  Soja: '#16a34a',
  Milho: '#f59e0b',
  Algodão: '#e2e8f0',
};
const colorForCulture = (culture: string) => CULTURE_COLORS[culture] ?? '#0ea5e9';

interface FieldMapProps {
  fields: CropField[];
  center: [number, number];
  editingFieldUuid: string | null;
  onBoundaryChange: (uuid: string, boundary: [number, number][] | null, areaHa: number) => void;
  onSelectField?: (uuid: string) => void;
}

// Mapa interativo (Leaflet + OpenStreetMap/Esri, sem chave de API) para
// visualizar e desenhar o perímetro dos talhões.
export const FieldMap: React.FC<FieldMapProps> = ({ fields, center, editingFieldUuid, onBoundaryChange, onSelectField }) => {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const staticLayerRef = useRef<L.LayerGroup | null>(null);
  const editableLayerRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const onBoundaryChangeRef = useRef(onBoundaryChange);
  onBoundaryChangeRef.current = onBoundaryChange;
  const onSelectFieldRef = useRef(onSelectField);
  onSelectFieldRef.current = onSelectField;

  // Inicializa o mapa uma única vez.
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current).setView(center, 14);
    mapRef.current = map;

    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19,
    });
    satellite.addTo(map);
    L.control.layers({ 'Satélite': satellite, 'Mapa': streets }, undefined, { position: 'topright' }).addTo(map);

    staticLayerRef.current = L.layerGroup().addTo(map);
    editableLayerRef.current = new L.FeatureGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentraliza quando o centro padrão (fazenda selecionada) muda.
  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(center, mapRef.current.getZoom());
  }, [center]);

  // Redesenha os polígonos estáticos (talhões já com perímetro salvo).
  useEffect(() => {
    const map = mapRef.current;
    const layer = staticLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const allPoints: L.LatLngExpression[] = [];
    fields.forEach(f => {
      if (!f.boundary || f.boundary.length < 3 || f.uuid === editingFieldUuid) return;
      const poly = L.polygon(f.boundary, { color: colorForCulture(f.culture), weight: 2, fillOpacity: 0.25 });
      poly.bindTooltip(`${f.name} · ${f.culture} · ${f.area} ha`, { sticky: true });
      poly.on('click', () => onSelectFieldRef.current?.(f.uuid));
      poly.addTo(layer);
      f.boundary.forEach(p => allPoints.push(p));
    });
    if (allPoints.length && !editingFieldUuid) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
    }
  }, [fields, editingFieldUuid]);

  // Ativa/desativa o modo de desenho para o talhão selecionado para edição.
  useEffect(() => {
    const map = mapRef.current;
    const editable = editableLayerRef.current;
    if (!map || !editable) return;

    editable.clearLayers();
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }
    if (!editingFieldUuid) return;

    const field = fieldsRef.current.find(f => f.uuid === editingFieldUuid);
    if (field?.boundary && field.boundary.length >= 3) {
      const poly = L.polygon(field.boundary, { color: '#2563eb', weight: 3, fillOpacity: 0.3 });
      editable.addLayer(poly);
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    }

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        // showArea: false — evita um bug conhecido do leaflet-draw 1.0.4 ("type is not
        // defined" em GeometryUtil.readableArea) ao atualizar o tooltip durante o desenho.
        // A área final é calculada de forma confiável em commit() via geodesicArea.
        polygon: { allowIntersection: false, showArea: false, shapeOptions: { color: '#2563eb' } },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: { featureGroup: editable, remove: true },
    });
    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    const commit = () => {
      const layers = editable.getLayers() as L.Polygon[];
      if (!layers.length) {
        onBoundaryChangeRef.current(editingFieldUuid, null, 0);
        return;
      }
      const ring = layers[0].getLatLngs()[0] as L.LatLng[];
      const latlngs = ring.map(p => [p.lat, p.lng] as [number, number]);
      const areaM2 = (L as any).GeometryUtil.geodesicArea(ring);
      onBoundaryChangeRef.current(editingFieldUuid, latlngs, Math.round((areaM2 / 10000) * 100) / 100);
    };

    const handleCreated = (e: L.LeafletEvent) => {
      editable.clearLayers();
      editable.addLayer((e as any).layer);
      commit();
    };
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, commit);
    map.on(L.Draw.Event.DELETED, () => onBoundaryChangeRef.current(editingFieldUuid, null, 0));

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, commit);
      map.off(L.Draw.Event.DELETED);
    };
  }, [editingFieldUuid]);

  return <div ref={mapElRef} className="w-full h-[480px] rounded-xl overflow-hidden" />;
};
