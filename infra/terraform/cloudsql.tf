# Cloud SQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "sts-postgres-${var.environment}"
  database_version = "POSTGRES_17"
  region           = var.region

  settings {
    tier = var.db_tier

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "prod"
      start_time                     = "03:00"
    }

    maintenance_window {
      day  = 7  # Sunday
      hour = 4  # 4 AM
    }

    insights_config {
      query_insights_enabled = true
    }
  }

  deletion_protection = var.environment == "prod"

  depends_on = [
    google_project_service.apis,
    google_service_networking_connection.private_vpc_connection,
  ]
}

# Database
resource "google_sql_database" "database" {
  name     = "sts"
  instance = google_sql_database_instance.postgres.name
}

# Database User
resource "google_sql_user" "user" {
  name     = "sts"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Private IP configuration
resource "google_compute_global_address" "private_ip_address" {
  name          = "sts-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}
