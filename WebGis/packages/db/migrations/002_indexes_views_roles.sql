CREATE INDEX sectors_geometry_gist ON census_sectors USING gist(geometry);
CREATE INDEX facilities_location_gist ON facilities USING gist(location);
CREATE INDEX results_lookup ON risk_results(edition_id,view,category_key);
CREATE VIEW active_edition AS SELECT * FROM data_editions WHERE status='active';
DO $$ BEGIN CREATE ROLE webgis_api NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT SELECT ON active_edition,census_sectors,facilities,risk_results TO webgis_api;
