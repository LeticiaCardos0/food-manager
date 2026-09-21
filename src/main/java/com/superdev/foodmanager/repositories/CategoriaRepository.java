package com.superdev.foodmanager.repositories;

import com.superdev.foodmanager.models.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}
