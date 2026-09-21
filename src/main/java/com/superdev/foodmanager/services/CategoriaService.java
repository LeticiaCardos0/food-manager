package com.superdev.foodmanager.services;


import com.superdev.foodmanager.dtos.categoria.CategoriaCriarDto;
import com.superdev.foodmanager.models.Categoria;
import com.superdev.foodmanager.repositories.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {
    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public List<Categoria> listar(){
        return this.repository.findAll();
    }
    public Categoria criar(CategoriaCriarDto dado){
        var categoria = Categoria.builder()
                .nome(dado.nome())
                .descricao(dado.descricao())
                .build();

        return this.repository.save(categoria);
    }
}
