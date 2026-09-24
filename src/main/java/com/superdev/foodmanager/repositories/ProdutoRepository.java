package com.superdev.foodmanager.repositories;

import com.superdev.foodmanager.models.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto,Integer> {
}
