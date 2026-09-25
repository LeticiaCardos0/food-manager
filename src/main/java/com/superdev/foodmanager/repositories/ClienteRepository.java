package com.superdev.foodmanager.repositories;

import com.superdev.foodmanager.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente,Integer> {
}
